/** Каталог товаров API: фильтры, сортировка, пагинация, in-memory кэш. */

import { prisma } from "@/prisma/prisma-client";
import { PRODUCTS_LIST_CACHE_TTL_MS } from "@/shared/constants";
import { buildPaginatedResponse, calculateSkip } from "@/shared/lib/pagination";
import { getOrSetAsync } from "@/shared/lib/cache";
import { logger } from "@/shared/lib/logger";
import { retryWithBackoff } from "@/shared/lib/retry";
import {
  buildProductsWhere,
  getProductsCacheKey,
  getProductsSortedByPopularity,
  getProductsWithMinPrice,
  mapProductsToListDto,
  type ProductWithRelations,
} from "@/shared/lib/products";
import type * as DTO from "@/shared/services/dto";

// ─── Кэш каталога (getOrSetAsync — single-flight при промахе) ─────────────────

// ─── Константа select (общий набор полей для списка) ────────────────────────

const CATALOG_LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  images: true,
  tags: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  items: {
    select: {
      id: true,
      price: true,
      color: true,
      size: true,
      sku: true,
      isAvailable: true,
      imageUrls: true,
    },
  },
} as const;

// ─── Сервис ─────────────────────────────────────────────────────────────────

export class CatalogProductsService {
  /** Список товаров по query (фильтры, сорт, пагинация), с кэшем и retry. */
  static async getProducts(query: {
    page: number;
    perPage: number;
    categorySlug?: string[];
    color?: string[];
    size?: DTO.SizeDto[];
    priceFrom?: number;
    priceTo?: number;
    sku?: string;
    q?: string;
    sort: DTO.ProductsQueryDto["sort"];
  }): Promise<DTO.ProductsListResponseDto> {
    try {
      const cacheKey = getProductsCacheKey(query);
      const { value } = await getOrSetAsync(
        cacheKey,
        async () => {
          return retryWithBackoff(
            async () => {
              const products = await this.fetchProductsFromDb(query);
              const listItems = mapProductsToListDto(products);
              const where = buildProductsWhere(query);
              const totalCount = await prisma.product.count({ where });
              return buildPaginatedResponse(listItems, totalCount, query.page, query.perPage);
            },
            {
              maxRetries: 3,
              initialDelay: 500,
              shouldRetry: (error) => {
                if (error && typeof error === "object" && "code" in error)
                  return String((error as { code?: string }).code).startsWith("P10");
                if (error && typeof error === "object" && "message" in error) {
                  const msg = String((error as { message?: string }).message);
                  return (
                    msg.includes("Server has closed the connection") ||
                    msg.includes("connection closed")
                  );
                }
                return false;
              },
            }
          );
        },
        PRODUCTS_LIST_CACHE_TTL_MS
      );
      return value;
    } catch (error) {
      logger.error("Error fetching catalog products", error);
      return buildPaginatedResponse([], 0, query.page, query.perPage);
    }
  }

  private static async fetchProductsFromDb(query: {
    page: number;
    perPage: number;
    categorySlug?: string[];
    color?: string[];
    size?: DTO.SizeDto[];
    priceFrom?: number;
    priceTo?: number;
    sku?: string;
    q?: string;
    sort: DTO.ProductsQueryDto["sort"];
  }): Promise<ProductWithRelations[]> {
    const where = buildProductsWhere(query);
    const isPriceSort = query.sort === "price_asc" || query.sort === "price_desc";
    const isPopularSort = query.sort === "popular";

    let products: ProductWithRelations[] = [];

    if (isPriceSort) {
      const orderBy = query.sort === "price_asc" ? "asc" : "desc";
      const skip = calculateSkip(query.page, query.perPage);

      const productsWithPrice = await getProductsWithMinPrice(
        prisma,
        where,
        orderBy,
        skip,
        query.perPage
      );

      if (productsWithPrice.length > 0) {
        const productIds = productsWithPrice.map((p) => p.productId);
        products = await prisma.product.findMany({
          where: {
            ...where,
            id: { in: productIds },
          },
          select: CATALOG_LIST_SELECT,
        });

        // Сортируем в том же порядке, что и productsWithPrice
        const orderMap = new Map(productsWithPrice.map((p, index) => [p.productId, index]));
        products.sort((a, b) => {
          const indexA = orderMap.get(a.id) ?? Infinity;
          const indexB = orderMap.get(b.id) ?? Infinity;
          return indexA - indexB;
        });
      }
    } else if (isPopularSort) {
      const skip = calculateSkip(query.page, query.perPage);
      products = await getProductsSortedByPopularity(prisma, where, skip, query.perPage);
    } else {
      products = await prisma.product.findMany({
        where,
        select: CATALOG_LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip: calculateSkip(query.page, query.perPage),
        take: query.perPage,
      });
    }

    return products;
  }
}
