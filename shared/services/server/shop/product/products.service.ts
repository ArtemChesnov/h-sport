/** Продукты для SSR: новинки, бестселлеры, каталог, деталка по slug. */

import { prisma as defaultPrisma } from "@/prisma/prisma-client";
import { POPULARITY_CACHE_TTL_MS } from "@/shared/constants";
import { get, set } from "@/shared/lib/cache";
import { logger } from "@/shared/lib/logger";
import {
    buildProductsWhere,
    getProductsSortedByPopularity,
    mapProductsToListDto,
    mapProductToDetailDto,
    type ProductDetailWithRelations,
} from "@/shared/lib/products";
import { retryWithBackoff } from "@/shared/lib/retry";
import type { DTO } from "@/shared/services";

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

/** Новинки (limit штук), с in-memory кэшем и retry. */
export async function getNewProducts(
  limit: number = 3,
): Promise<DTO.ProductListItemDto[]> {
  const cacheKey = `new-products:${limit}`;
  const cached = get<DTO.ProductListItemDto[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const where = buildProductsWhere({});

    // Используем retry логику для обработки ошибок соединения
    const products = await retryWithBackoff(
      () =>
        defaultPrisma.product.findMany({
          where,
          select: PRODUCT_LIST_SELECT,
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
        }),
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
      },
    );

    const result = mapProductsToListDto(products);
    set(cacheKey, result, POPULARITY_CACHE_TTL_MS);
    return result;
  } catch (error) {
    logger.error("Error fetching new products", error);
    return [];
  }
}

/** Популярные товары (limit штук) для блоков «Вам понравится» и др. Кэш по ключу popular:{limit}. */
export async function getPopularProducts(
  limit: number,
): Promise<DTO.ProductListItemDto[]> {
  const cacheKey = `popular:${limit}`;
  const cached = get<DTO.ProductListItemDto[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const where = buildProductsWhere({});
    const products = await retryWithBackoff(
      () => getProductsSortedByPopularity(defaultPrisma, where, 0, limit),
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
      },
    );
    const result = mapProductsToListDto(products);
    set(cacheKey, result, POPULARITY_CACHE_TTL_MS);
    return result;
  } catch (error) {
    logger.error("Error fetching popular products", error);
    return [];
  }
}

/** Рекомендации «Вам понравится»: популярные товары без текущего, до displayLimit штук. */
export async function getYouMightLikeProducts(
  excludeProductId: number,
  displayLimit: number = 4,
): Promise<DTO.ProductListItemDto[]> {
  const fetchLimit = Math.max(displayLimit + 4, 12);
  const popular = await getPopularProducts(fetchLimit);
  return popular
    .filter((p) => p.id !== excludeProductId)
    .slice(0, displayLimit);
}

/** Бестселлеры по популярности (SQL JOIN), с кэшем. _fetchLimit — legacy. */
export async function getBestSellers(
  limit: number = 4,
  _fetchLimit?: number,
): Promise<DTO.ProductListItemDto[]> {
  const cacheKey = `bestsellers:${limit}`;
  const cached = get<DTO.ProductListItemDto[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const where = buildProductsWhere({});
    const products = await retryWithBackoff(
      () => getProductsSortedByPopularity(defaultPrisma, where, 0, limit),
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
      },
    );
    const result = mapProductsToListDto(products);
    set(cacheKey, result, POPULARITY_CACHE_TTL_MS);
    return result;
  } catch (error) {
    logger.error("Error fetching best sellers", error);
    return [];
  }
}

/** Первая страница каталога без фильтров (SSR). */
export async function getInitialCatalogProducts(
  perPage: number = 24,
): Promise<{
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
      },
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

/** Деталка товара по slug или null. */
export async function getProductBySlug(slug: string): Promise<DTO.ProductDetailDto | null> {
  const product = await defaultPrisma.product.findUnique({
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
  });

  if (!product) {
    return null;
  }

  return mapProductToDetailDto(product as ProductDetailWithRelations);
}

/**
 * Список slug товаров для generateStaticParams (pre-render при ENABLE_PRODUCT_PRE_RENDER=true).
 */
export async function getProductSlugsForPreRender(limit: number = 100): Promise<{ slug: string }[]> {
  const topProducts = await defaultPrisma.product.findMany({
    select: { slug: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return topProducts.map((p) => ({ slug: p.slug }));
}
