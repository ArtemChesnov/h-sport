/**
 * Сервис для анализа брошенных корзин
 * Оптимизирован: использует SQL с LEFT JOIN вместо загрузки всех корзин в память
 */

import { prisma } from "@/prisma/prisma-client";

export interface AbandonedCartsAnalysis {
  total: number;
  totalValue: number;
  averageValue: number;
  withPromoCode: number;
  topProducts: Array<{ id: number; name: string; slug: string; count: number }>;
  byHour: Array<{ hour: number; count: number }>;
  averageCartSize: number;
  /** Процент брошенных корзин от общего числа корзин с товарами */
  abandonmentRate: number;
}

interface AbandonedCartSummary {
  total: bigint;
  total_value: number | null;
  total_items: bigint | null;
  with_promo: bigint;
}

interface TopProductRow {
  product_id: number;
  name: string;
  slug: string;
  count: bigint;
}

interface HourCountRow {
  hour: number;
  count: bigint;
}

export async function getAbandonedCartsAnalysis(days: number): Promise<AbandonedCartsAnalysis> {
  const now = new Date();
  const from = new Date();
  from.setDate(now.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  // Оптимизированный запрос: используем LEFT JOIN для поиска брошенных корзин
  // Брошенная корзина = корзина с cartToken, у которой нет соответствующего заказа
  const [summary] = await prisma.$queryRaw<AbandonedCartSummary[]>`
    SELECT
      COUNT(*)::bigint AS total,
      SUM(c.total) AS total_value,
      SUM(c."totalItems")::bigint AS total_items,
      COUNT(CASE WHEN c."promoCodeId" IS NOT NULL THEN 1 END)::bigint AS with_promo
    FROM "Cart" c
    LEFT JOIN "Order" o ON o."cartToken" = c."cartToken"
    WHERE c."createdAt" >= ${from}
      AND c."createdAt" <= ${now}
      AND c."cartToken" IS NOT NULL
      AND c."totalItems" > 0
      AND o.id IS NULL
  `;

  // Топ-5 товаров в брошенных корзинах
  const topProducts = await prisma.$queryRaw<TopProductRow[]>`
    SELECT
      p.id AS product_id,
      p.name,
      p.slug,
      SUM(ci.qty)::bigint AS count
    FROM "Cart" c
    LEFT JOIN "Order" o ON o."cartToken" = c."cartToken"
    INNER JOIN "CartItem" ci ON ci."cartId" = c.id
    INNER JOIN "ProductItem" pi ON pi.id = ci."productItemId"
    INNER JOIN "Product" p ON p.id = pi."productId"
    WHERE c."createdAt" >= ${from}
      AND c."createdAt" <= ${now}
      AND c."cartToken" IS NOT NULL
      AND o.id IS NULL
    GROUP BY p.id, p.name, p.slug
    ORDER BY count DESC
    LIMIT 5
  `;

  // Распределение по часам
  const byHourRaw = await prisma.$queryRaw<HourCountRow[]>`
    SELECT
      EXTRACT(HOUR FROM c."createdAt")::int AS hour,
      COUNT(*)::bigint AS count
    FROM "Cart" c
    LEFT JOIN "Order" o ON o."cartToken" = c."cartToken"
    WHERE c."createdAt" >= ${from}
      AND c."createdAt" <= ${now}
      AND c."cartToken" IS NOT NULL
      AND c."totalItems" > 0
      AND o.id IS NULL
    GROUP BY hour
    ORDER BY hour
  `;

  // Общее количество корзин с товарами для расчета abandonment rate
  const [totalCartsResult] = await prisma.$queryRaw<[{ total: bigint }]>`
    SELECT COUNT(*)::bigint AS total
    FROM "Cart" c
    WHERE c."createdAt" >= ${from}
      AND c."createdAt" <= ${now}
      AND c."cartToken" IS NOT NULL
      AND c."totalItems" > 0
  `;

  const total = Number(summary?.total ?? 0);
  const totalValue = Number(summary?.total_value ?? 0);
  const totalItems = Number(summary?.total_items ?? 0);
  const withPromoCode = Number(summary?.with_promo ?? 0);
  const totalCarts = Number(totalCartsResult?.total ?? 0);

  const averageValue = total > 0 ? Math.round(totalValue / total) : 0;
  const averageCartSize = total > 0 ? Math.round((totalItems / total) * 100) / 100 : 0;
  const abandonmentRate = totalCarts > 0 ? Math.round((total / totalCarts) * 10000) / 100 : 0;

  // Создаем полный массив часов (0-23) с дефолтными значениями
  const hourCountsMap = new Map(byHourRaw.map((r) => [r.hour, Number(r.count)]));
  const byHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourCountsMap.get(hour) || 0,
  }));

  return {
    total,
    totalValue,
    averageValue,
    withPromoCode,
    topProducts: topProducts.map((p) => ({
      id: p.product_id,
      name: p.name,
      slug: p.slug,
      count: Number(p.count),
    })),
    byHour,
    averageCartSize,
    abandonmentRate,
  };
}
