/** Каталог товаров API: фильтры, сортировка, пагинация, кэш (Redis + in-memory). */

import { prisma } from "@/prisma/prisma-client";
import { PRODUCTS_LIST_CACHE_TTL_MS } from "@/shared/constants";
import { buildPaginatedResponse, calculateSkip } from "@/shared/lib";
import { getAsync, set } from "@/shared/lib/cache";
import {
    buildProductsWhere,
    getProductsCacheKey,
    getProductsSortedByPopularity,
    getProductsWithMinPrice,
    mapProductsToListDto,
    type ProductWithRelations,
} from "@/shared/lib/products";
import type * as DTO from "@/shared/services/dto";

// ─── Кэш каталога ──────────────────────────────────────────────────────────

/**
 * Получает кешированный список товаров.
 */
async function getCachedProducts(cacheKey: string): Promise<DTO.ProductsListResponseDto | null> {
  return await getAsync<DTO.ProductsListResponseDto>(cacheKey);
}

/**
 * Сохраняет список товаров в кеш.
 */
async function setProductsCache(cacheKey: string, data: DTO.ProductsListResponseDto): Promise<void> {
  await set(cacheKey, data, PRODUCTS_LIST_CACHE_TTL_MS);
}

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
  /** Список товаров по query (фильтры, сорт, пагинация), с кэшем. */
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
    // Проверяем кеш
    const cacheKey = getProductsCacheKey(query);
    const cached = await getCachedProducts(cacheKey);
    if (cached) {
      return cached;
    }

    // Получаем данные из БД
    const products = await this.fetchProductsFromDb(query);

    // Маппим в DTO
    const listItems = mapProductsToListDto(products);

    // Получаем общее количество товаров для пагинации
    const where = buildProductsWhere(query);
    const totalCount = await prisma.product.count({ where });

    // Строим пагинированный ответ
    const responseBody = buildPaginatedResponse(listItems, totalCount, query.page, query.perPage);

    // Сохраняем в кеш
    await setProductsCache(cacheKey, responseBody);

    return responseBody;
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

      const productsWithPrice = await getProductsWithMinPrice(prisma, where, orderBy, skip, query.perPage);

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
