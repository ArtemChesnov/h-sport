/**
 * Кэширование популярности товаров (in-memory).
 */

import { POPULARITY_CACHE_TTL_MS } from "@/shared/constants";
import type { PrismaClient } from "@prisma/client";
import { Prisma, Size } from "@prisma/client";

const popularityCache = new Map<string, { data: Record<number, number>; timestamp: number }>();
const CACHE_TTL = POPULARITY_CACHE_TTL_MS;

/**
 * Получает карту популярности продуктов на основе проданных единиц.
 *
 * @param prismaOrTx - Экземпляр Prisma Client или транзакция для выполнения запросов
 * @returns Promise с объектом, где ключ - productId, значение - количество проданных единиц
 *
 * @description
 * Карта популярности продуктов: productId → суммарное количество проданных единиц.
 * Учитываются только заказы в статусах: PAID, SHIPPED, DELIVERED.
 * Результат кэшируется на 5 минут для улучшения производительности.
 *
 * @example
 * ```typescript
 * const popularity = await getProductsPopularityMap(prisma);
 * const product1Popularity = popularity[1] || 0;
 * ```
 */
export async function getProductsPopularityMap(
  prismaOrTx: PrismaClient | Prisma.TransactionClient
): Promise<Record<number, number>> {
  const cacheKey = "popularity_map";
  const now = Date.now();

  const cached = popularityCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const rows = await prismaOrTx.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      qty: true,
    },
    where: {
      order: {
        status: {
          in: ["PAID", "SHIPPED", "DELIVERED"],
        },
      },
    },
  });

  const popularity: Record<number, number> = {};

  for (const row of rows) {
    popularity[row.productId] = row._sum.qty ?? 0;
  }

  popularityCache.set(cacheKey, { data: popularity, timestamp: now });

  return popularity;
}

/**
 * Получает товары, отсортированные по популярности на уровне БД.
 * Использует SQL JOIN с OrderItem для расчета популярности без загрузки всех товаров в память.
 *
 * @param prismaOrTx - Экземпляр Prisma Client или транзакция
 * @param where - Условия фильтрации товаров
 * @param skip - Количество пропускаемых записей (для пагинации)
 * @param take - Количество записей для возврата
 * @returns Массив товаров с нужными связями, отсортированных по популярности
 *
 * @description
 * Сортировка по популярности происходит на уровне БД через LEFT JOIN с OrderItem.
 * Популярность рассчитывается как сумма проданных единиц (qty) для заказов в статусах PAID, SHIPPED, DELIVERED.
 * Товары без продаж получают популярность 0 и сортируются по дате создания (новые первыми).
 * Это позволяет избежать загрузки до 1000 товаров в память для сортировки.
 */
export async function getProductsSortedByPopularity(
  prismaOrTx: PrismaClient | Prisma.TransactionClient,
  where: Prisma.ProductWhereInput,
  skip: number,
  take: number
): Promise<
  Array<{
    id: number;
    slug: string;
    name: string;
    images: string[];
    tags: string[];
    categoryId: number;
    category: {
      id: number;
      slug: string;
      name: string;
    };
    items: Array<{
      id: number;
      price: number;
      color: string;
      size: Size;
      sku: string | null;
      isAvailable: boolean;
      imageUrls: string[];
    }>;
  }>
> {
  // Безопасное построение JOIN для категории через Prisma.sql (предотвращает SQL injection)
  let categoryJoinSql: Prisma.Sql = Prisma.empty;
  if (where.category && typeof where.category === "object" && "slug" in where.category) {
    const categorySlug = where.category.slug;
    if (typeof categorySlug === "string") {
      // Одна категория - параметризация через Prisma.sql
      categoryJoinSql = Prisma.sql`INNER JOIN "Category" c ON p."categoryId" = c.id AND c.slug = ${categorySlug}`;
    } else if (
      categorySlug &&
      typeof categorySlug === "object" &&
      "in" in categorySlug &&
      Array.isArray(categorySlug.in) &&
      categorySlug.in.length > 0
    ) {
      // Множественные категории - параметризация с явным кастом массива
      categoryJoinSql = Prisma.sql`INNER JOIN "Category" c ON p."categoryId" = c.id AND c.slug = ANY(${categorySlug.in}::text[])`;
    }
  }

  // Используем raw SQL для эффективной сортировки по популярности на уровне БД
  const productsWithPopularity = await prismaOrTx.$queryRaw<
    Array<{
      id: number;
      slug: string;
      name: string;
      images: string[];
      tags: string[];
      categoryId: number;
      popularity: bigint;
    }>
  >`
    SELECT
      p.id,
      p.slug,
      p.name,
      p.images,
      p.tags,
      p."categoryId",
      COALESCE(SUM(oi.qty), 0)::bigint as popularity
    FROM "Product" p
    LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
    LEFT JOIN "Order" o ON oi."orderId" = o.id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
    ${categoryJoinSql}
    GROUP BY p.id, p.slug, p.name, p.images, p.tags, p."categoryId", p."createdAt"
    ORDER BY popularity DESC, p."createdAt" DESC
    LIMIT ${take} OFFSET ${skip}
  `;

  if (productsWithPopularity.length === 0) {
    return [];
  }

  const productIds = productsWithPopularity.map((p) => p.id);

  // Загружаем полные данные товаров с нужными связями
  const products = await prismaOrTx.product.findMany({
    where: {
      ...where,
      id: {
        in: productIds,
      },
    },
    select: {
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
    },
  });

  // Сохраняем порядок сортировки из SQL-запроса
  const orderMap = new Map(productsWithPopularity.map((p, index) => [p.id, index]));
  products.sort((a, b) => {
    const indexA = orderMap.get(a.id) ?? Infinity;
    const indexB = orderMap.get(b.id) ?? Infinity;
    return indexA - indexB;
  });

  return products;
}

/**
 * Получает ID товаров, отсортированных по популярности на уровне БД.
 * Использует SQL для расчета популярности без загрузки всех товаров в память.
 *
 * @param prismaOrTx - Экземпляр Prisma Client или транзакция
 * @param where - Условия фильтрации товаров (используется для получения списка ID)
 * @param skip - Количество пропускаемых записей (для пагинации)
 * @param take - Количество записей для возврата
 * @returns Массив ID товаров, отсортированных по популярности
 *
 * @description
 * Сортировка по популярности происходит на уровне БД через LEFT JOIN с OrderItem.
 * Популярность рассчитывается как сумма проданных единиц (qty) для заказов в статусах PAID, SHIPPED, DELIVERED.
 * Товары без продаж получают популярность 0 и сортируются по дате создания (новые первыми).
 */
export async function getProductIdsSortedByPopularity(
  prismaOrTx: PrismaClient | Prisma.TransactionClient,
  where: Prisma.ProductWhereInput,
  skip: number,
  take: number
): Promise<number[]> {
  // Сначала получаем ID товаров, соответствующих фильтрам
  const filteredProducts = await prismaOrTx.product.findMany({
    where,
    select: {
      id: true,
    },
  });

  if (filteredProducts.length === 0) {
    return [];
  }

  const productIds = filteredProducts.map((p) => p.id);

  // Используем raw SQL для эффективной сортировки по популярности на уровне БД
  if (productIds.length === 0) {
    return [];
  }

  const productsWithPopularity = await prismaOrTx.$queryRaw<
    Array<{
      id: number;
    }>
  >(
    Prisma.sql`
      SELECT p.id
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
      LEFT JOIN "Order" o ON oi."orderId" = o.id AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
      WHERE p.id IN (${Prisma.join(productIds)})
      GROUP BY p.id, p."createdAt"
      ORDER BY COALESCE(SUM(oi.qty), 0) DESC, p."createdAt" DESC
      LIMIT ${take} OFFSET ${skip}
    `
  );

  return productsWithPopularity.map((p) => p.id);
}
