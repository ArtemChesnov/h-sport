/** Продукты для SSR: новинки, бестселлеры, каталог, деталка по slug. */

import { prisma as defaultPrisma } from "@/prisma/prisma-client";
import { POPULARITY_CACHE_TTL_MS, PRODUCT_SLUG_CACHE_TTL_MS } from "@/shared/constants";
import {
  getOrSetAsync,
  getNewProductsCacheKey,
  getPopularCacheKey,
  getBestsellersCacheKey,
  getProductCacheKey,
} from "@/shared/lib/cache";
import { logger } from "@/shared/lib/logger";
import {
  buildProductsWhere,
  getProductsSortedByPopularity,
  mapProductsToListDto,
  mapProductToDetailDto,
  type ProductDetailWithRelations,
} from "@/shared/lib/products";
import { retryWithBackoff } from "@/shared/lib/retry";
import type * as DTO from "@/shared/services/dto";

const PRODUCT_LIST_SELECT = {
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

/** Новинки (limit штук), с in-memory кэшем и retry (single-flight при промахе). */
export async function getNewProducts(limit: number = 3): Promise<DTO.ProductListItemDto[]> {
  try {
    const { value } = await getOrSetAsync(
      getNewProductsCacheKey(limit),
      async () => {
        const where = buildProductsWhere({});
        const products = await retryWithBackoff(
          () =>
            defaultPrisma.product.findMany({
              where,
              select: PRODUCT_LIST_SELECT,
              orderBy: { createdAt: "desc" },
              take: limit,
            }),
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
        return mapProductsToListDto(products);
      },
      POPULARITY_CACHE_TTL_MS
    );
    return value;
  } catch (error) {
    logger.error("Error fetching new products", error);
    return [];
  }
}

/** Популярные товары (limit штук) для блоков «Вам понравится» и др. Кэш по ключу popular:v1:{limit}. */
export async function getPopularProducts(limit: number): Promise<DTO.ProductListItemDto[]> {
  try {
    const { value } = await getOrSetAsync(
      getPopularCacheKey(limit),
      async () => {
        const where = buildProductsWhere({});
        const products = await retryWithBackoff(
          () => getProductsSortedByPopularity(defaultPrisma, where, 0, limit),
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
        return mapProductsToListDto(products);
      },
      POPULARITY_CACHE_TTL_MS
    );
    return value;
  } catch (error) {
    logger.error("Error fetching popular products", error);
    return [];
  }
}

/** Рекомендации «Вам понравится»: популярные товары без текущего, до displayLimit штук. */
export async function getYouMightLikeProducts(
  excludeProductId: number,
  displayLimit: number = 4
): Promise<DTO.ProductListItemDto[]> {
  const fetchLimit = Math.max(displayLimit + 4, 12);
  const popular = await getPopularProducts(fetchLimit);
  return popular.filter((p) => p.id !== excludeProductId).slice(0, displayLimit);
}

/** Бестселлеры по популярности (SQL JOIN), с кэшем. _fetchLimit — legacy. */
export async function getBestSellers(
  limit: number = 4,
  _fetchLimit?: number
): Promise<DTO.ProductListItemDto[]> {
  try {
    const { value } = await getOrSetAsync(
      getBestsellersCacheKey(limit),
      async () => {
        const where = buildProductsWhere({});
        const products = await retryWithBackoff(
          () => getProductsSortedByPopularity(defaultPrisma, where, 0, limit),
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
        return mapProductsToListDto(products);
      },
      POPULARITY_CACHE_TTL_MS
    );
    return value;
  } catch (error) {
    logger.error("Error fetching best sellers", error);
    return [];
  }
}

/** Первая страница каталога без фильтров (SSR). */
export async function getInitialCatalogProducts(perPage: number = 24): Promise<{
  items: DTO.ProductListItemDto[];
  meta: DTO.PaginationMetaDto;
}> {
  try {
    const where = buildProductsWhere({});
    const [total, products] = await retryWithBackoff(
      async () => {
        const [countResult, productsResult] = await Promise.all([
          defaultPrisma.product.count({ where }),
          defaultPrisma.product.findMany({
            where,
            select: PRODUCT_LIST_SELECT,
            orderBy: {
              createdAt: "desc",
            },
            take: perPage,
          }),
        ]);
        return [countResult, productsResult] as const;
      },
      {
        maxRetries: 3,
        initialDelay: 500,
        shouldRetry: (error) => {
          if (error && typeof error === "object" && "code" in error) {
            const code = String(error.code);
            return code.startsWith("P10");
          }
          if (error && typeof error === "object" && "message" in error) {
            const message = String(error.message);
            return (
              message.includes("Server has closed the connection") ||
              message.includes("connection closed")
            );
          }
          return false;
        },
      }
    );

    const items = mapProductsToListDto(products);
    const pages = Math.max(Math.ceil(total / perPage), 1);

    return {
      items,
      meta: {
        page: 1,
        perPage,
        total,
        pages,
      },
    };
  } catch (error) {
    logger.error("Error fetching initial catalog products", error);
    return {
      items: [],
      meta: {
        page: 1,
        perPage,
        total: 0,
        pages: 1,
      },
    };
  }
}

/** Деталка товара по slug или null. Кэшируется на PRODUCT_SLUG_CACHE_TTL_MS. */
export async function getProductBySlug(slug: string): Promise<DTO.ProductDetailDto | null> {
  try {
    const cacheKey = getProductCacheKey(slug);
    const { value } = await getOrSetAsync(
      cacheKey,
      async () => {
        const product = await retryWithBackoff(
          () =>
            defaultPrisma.product.findUnique({
              where: { slug },
              select: {
                id: true,
                slug: true,
                name: true,
                description: true,
                composition: true,
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
                    sku: true,
                    color: true,
                    size: true,
                    price: true,
                    isAvailable: true,
                    imageUrls: true,
                  },
                },
              },
            }),
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

        if (!product) return null;
        const dto = mapProductToDetailDto(product as ProductDetailWithRelations);
        return dto ?? null;
      },
      PRODUCT_SLUG_CACHE_TTL_MS,
      { cacheNull: true, nullTtlMs: 30000 }
    );
    return value;
  } catch (error) {
    logger.error("Error fetching product by slug", error);
    return null;
  }
}

/**
 * Список slug товаров для generateStaticParams (pre-render при ENABLE_PRODUCT_PRE_RENDER=true).
 */
export async function getProductSlugsForPreRender(
  limit: number = 100
): Promise<{ slug: string }[]> {
  const topProducts = await defaultPrisma.product.findMany({
    select: { slug: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return topProducts.map((p) => ({ slug: p.slug }));
}
