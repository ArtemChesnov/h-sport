/**
 * Агрегация e-commerce метрик на уровне БД через SQL
 */

import { TEST_USER_EMAIL } from "@/shared/lib/auth/privileged";

/**
 * Получает агрегированные e-commerce метрики по часам/дням
 * Полезно для долгосрочного анализа трендов
 */
export async function getAggregatedEcommerceMetrics(
  timeWindowMs: number = 7 * 24 * 60 * 60 * 1000, // По умолчанию 7 дней
  aggregationInterval: "hour" | "day" = "day"
) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - timeWindowMs);

  try {
    const { prisma } = await import("@/prisma/prisma-client");

    // Используем SQL для агрегации на уровне БД (более эффективно)
    const viewsAggregation =
      aggregationInterval === "hour"
        ? await prisma.$queryRaw<
            Array<{
              period: Date;
              count: bigint;
            }>
          >`
          SELECT
            DATE_TRUNC('hour', "createdAt") AS period,
            COUNT(*)::bigint AS count
          FROM "ProductView"
          WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
          GROUP BY period
          ORDER BY period ASC
        `
        : await prisma.$queryRaw<
            Array<{
              period: Date;
              count: bigint;
            }>
          >`
          SELECT
            DATE_TRUNC('day', "createdAt") AS period,
            COUNT(*)::bigint AS count
          FROM "ProductView"
          WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
          GROUP BY period
          ORDER BY period ASC
        `;

    const cartAggregation =
      aggregationInterval === "hour"
        ? await prisma.$queryRaw<
            Array<{
              period: Date;
              count: bigint;
            }>
          >`
          SELECT
            DATE_TRUNC('hour', "createdAt") AS period,
            COUNT(*)::bigint AS count
          FROM "CartAction"
          WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
            AND action = 'add'
          GROUP BY period
          ORDER BY period ASC
        `
        : await prisma.$queryRaw<
            Array<{
              period: Date;
              count: bigint;
            }>
          >`
          SELECT
            DATE_TRUNC('day', "createdAt") AS period,
            COUNT(*)::bigint AS count
          FROM "CartAction"
          WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
            AND action = 'add'
          GROUP BY period
          ORDER BY period ASC
        `;

    const conversionsAggregation =
      aggregationInterval === "hour"
        ? await prisma.$queryRaw<
            Array<{
              period: Date;
              type: string;
              count: bigint;
            }>
          >`
          SELECT
            DATE_TRUNC('hour', c."createdAt") AS period,
            c.type,
            COUNT(*)::bigint AS count
          FROM "Conversion" c
          LEFT JOIN "Order" o ON o.id = c."orderId"
          WHERE c."createdAt" >= ${cutoff} AND c."createdAt" <= ${now}
            AND (c."orderId" IS NULL OR o.email <> ${TEST_USER_EMAIL})
          GROUP BY period, c.type
          ORDER BY period ASC
        `
        : await prisma.$queryRaw<
            Array<{
              period: Date;
              type: string;
              count: bigint;
            }>
          >`
          SELECT
            DATE_TRUNC('day', c."createdAt") AS period,
            c.type,
            COUNT(*)::bigint AS count
          FROM "Conversion" c
          LEFT JOIN "Order" o ON o.id = c."orderId"
          WHERE c."createdAt" >= ${cutoff} AND c."createdAt" <= ${now}
            AND (c."orderId" IS NULL OR o.email <> ${TEST_USER_EMAIL})
          GROUP BY period, c.type
          ORDER BY period ASC
        `;

    // Преобразуем результаты
    type AggregatedEntry = {
      period: Date;
      views: number;
      cartAdds: number;
      viewToCart: number;
      cartToOrder: number;
    };
    const aggregatedData = new Map<string, AggregatedEntry>();

    // Вспомогательная функция для получения или создания записи
    const getOrCreate = (key: string, period: Date): AggregatedEntry => {
      let entry = aggregatedData.get(key);
      if (!entry) {
        entry = {
          period,
          views: 0,
          cartAdds: 0,
          viewToCart: 0,
          cartToOrder: 0,
        };
        aggregatedData.set(key, entry);
      }
      return entry;
    };

    // Добавляем просмотры
    for (const row of viewsAggregation) {
      const key = row.period.toISOString();
      const entry = getOrCreate(key, row.period);
      entry.views = Number(row.count);
    }

    // Добавляем добавления в корзину
    for (const row of cartAggregation) {
      const key = row.period.toISOString();
      const entry = getOrCreate(key, row.period);
      entry.cartAdds = Number(row.count);
    }

    // Добавляем конверсии
    for (const row of conversionsAggregation) {
      const key = row.period.toISOString();
      const entry = getOrCreate(key, row.period);
      if (row.type === "view_to_cart") {
        entry.viewToCart = Number(row.count);
      } else if (row.type === "cart_to_order") {
        entry.cartToOrder = Number(row.count);
      }
    }

    // Преобразуем в массив и сортируем
    const result = Array.from(aggregatedData.values()).sort(
      (a, b) => a.period.getTime() - b.period.getTime()
    );

    return {
      period: {
        from: cutoff.toISOString(),
        to: now.toISOString(),
        windowMs: timeWindowMs,
      },
      aggregationInterval,
      data: result,
    };
  } catch {
    // Если запрос не удался, возвращаем пустые данные
    return {
      period: {
        from: cutoff.toISOString(),
        to: now.toISOString(),
        windowMs: timeWindowMs,
      },
      aggregationInterval,
      data: [],
    };
  }
}
