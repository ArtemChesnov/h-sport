/**
 * Функции для чтения e-commerce метрик из БД
 * Оптимизировано: используется агрегация на уровне БД вместо загрузки всех записей
 */

import type {
  ProductViewMetric,
  CartActionMetric,
  FavoriteActionMetric,
  ConversionMetric,
} from "./ecommerce-metrics-types";
import {
  productViews,
  cartActions,
  favoriteActions,
  conversions,
} from "./ecommerce-metrics-storage";
import { TEST_USER_EMAIL } from "@/shared/lib/auth/privileged";
import { MAX_METRICS_QUERY_LIMIT } from "@/shared/constants";

/**
 * Загружает метрики из БД за указанный период
 * Для коротких периодов (<= 7 дней) загружает записи
 * Для длинных периодов рекомендуется использовать getAggregatedMetricsFromDb
 */
export async function loadMetricsFromDb(
  cutoff: Date,
  now: Date
): Promise<{
  views: ProductViewMetric[];
  cartActions: CartActionMetric[];
  favorites: FavoriteActionMetric[];
  conversions: ConversionMetric[];
}> {
  try {
    const { prisma } = await import("@/prisma/prisma-client");

    const [dbViews, dbCartActions, dbFavorites, dbConversions] = await Promise.all([
      prisma.productView.findMany({
        where: { createdAt: { gte: cutoff } },
        take: MAX_METRICS_QUERY_LIMIT,
      }),
      prisma.cartAction.findMany({
        where: { createdAt: { gte: cutoff } },
        take: MAX_METRICS_QUERY_LIMIT,
      }),
      prisma.favoriteAction.findMany({
        where: { createdAt: { gte: cutoff } },
        take: MAX_METRICS_QUERY_LIMIT,
      }),
      prisma.conversion.findMany({
        where: {
          createdAt: { gte: cutoff },
          OR: [{ orderId: null }, { order: { email: { not: TEST_USER_EMAIL } } }],
        },
        take: MAX_METRICS_QUERY_LIMIT,
      }),
    ]);

    return {
      views: dbViews.map((v) => ({
        productId: v.productId,
        timestamp: v.createdAt.getTime(),
        userId: v.userId || undefined,
      })),
      cartActions: dbCartActions.map((a) => ({
        action: a.action as "add" | "remove" | "update",
        productId: a.productId,
        quantity: a.quantity,
        timestamp: a.createdAt.getTime(),
        userId: a.userId || undefined,
        cartId: a.cartId || undefined,
      })),
      favorites: dbFavorites.map((f) => ({
        action: f.action as "add" | "remove",
        productId: f.productId,
        timestamp: f.createdAt.getTime(),
        userId: f.userId,
      })),
      conversions: dbConversions.map((c) => ({
        type: c.type as "view_to_cart" | "cart_to_order" | "view_to_order",
        productId: c.productId || undefined,
        orderId: c.orderId || undefined,
        timestamp: c.createdAt.getTime(),
        userId: c.userId || undefined,
      })),
    };
  } catch {
    // Fallback на память
    const memoryCutoff = Date.now() - (now.getTime() - cutoff.getTime());
    return {
      views: productViews.filter((v) => v.timestamp >= memoryCutoff),
      cartActions: cartActions.filter((a) => a.timestamp >= memoryCutoff),
      favorites: favoriteActions.filter((f) => f.timestamp >= memoryCutoff),
      conversions: conversions.filter((c) => c.timestamp >= memoryCutoff),
    };
  }
}

/** Результат агрегации метрик */
export interface AggregatedMetricsResult {
  views: {
    total: number;
    uniqueUsers: number;
    topProducts: Array<{ productId: number; count: number }>;
  };
  cart: {
    totalAdds: number;
    uniqueUsers: number;
    topProducts: Array<{ productId: number; count: number }>;
  };
  favorites: {
    totalAdds: number;
    uniqueUsers: number;
    topProducts: Array<{ productId: number; count: number }>;
  };
  conversions: {
    viewToCart: number;
    cartToOrder: number;
    viewToOrder: number;
    viewToCartRate: number;
    cartToOrderRate: number;
  };
  engagement: {
    rate: number;
    engagedUsers: number;
    totalViewers: number;
  };
}

interface CountResult {
  count: bigint;
}
interface ProductCountResult {
  product_id: number;
  count: bigint;
}
interface ConversionCountResult {
  type: string;
  count: bigint;
}

/**
 * Получает агрегированные метрики напрямую из БД (без загрузки в память)
 * Оптимально для периодов > 7 дней
 */
export async function getAggregatedMetricsFromDb(
  cutoff: Date,
  now: Date
): Promise<AggregatedMetricsResult> {
  try {
    const { prisma } = await import("@/prisma/prisma-client");

    // Параллельно выполняем все агрегационные запросы
    const [
      // Views
      viewsTotal,
      viewsUniqueUsers,
      viewsTopProducts,
      // Cart
      cartAddsTotal,
      cartUniqueUsers,
      cartTopProducts,
      // Favorites
      favoritesAddsTotal,
      favoritesUniqueUsers,
      favoritesTopProducts,
      // Conversions
      conversionsCounts,
      // Engagement - unique engaged users
      engagedUsers,
    ] = await Promise.all([
      // Views total
      prisma.$queryRaw<[CountResult]>`
        SELECT COUNT(*)::bigint AS count FROM "ProductView"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
      `,
      // Views unique users
      prisma.$queryRaw<[CountResult]>`
        SELECT COUNT(DISTINCT "userId")::bigint AS count FROM "ProductView"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
        AND "userId" IS NOT NULL
      `,
      // Views top products
      prisma.$queryRaw<ProductCountResult[]>`
        SELECT "productId" AS product_id, COUNT(*)::bigint AS count
        FROM "ProductView"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
        GROUP BY "productId"
        ORDER BY count DESC
        LIMIT 10
      `,
      // Cart adds total
      prisma.$queryRaw<[CountResult]>`
        SELECT COUNT(*)::bigint AS count FROM "CartAction"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
        AND action = 'add'
      `,
      // Cart unique users
      prisma.$queryRaw<[CountResult]>`
        SELECT COUNT(DISTINCT "userId")::bigint AS count FROM "CartAction"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
        AND action = 'add' AND "userId" IS NOT NULL
      `,
      // Cart top products
      prisma.$queryRaw<ProductCountResult[]>`
        SELECT "productId" AS product_id, COUNT(*)::bigint AS count
        FROM "CartAction"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
        AND action = 'add'
        GROUP BY "productId"
        ORDER BY count DESC
        LIMIT 10
      `,
      // Favorites adds total
      prisma.$queryRaw<[CountResult]>`
        SELECT COUNT(*)::bigint AS count FROM "FavoriteAction"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
        AND action = 'add'
      `,
      // Favorites unique users
      prisma.$queryRaw<[CountResult]>`
        SELECT COUNT(DISTINCT "userId")::bigint AS count FROM "FavoriteAction"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
        AND action = 'add'
      `,
      // Favorites top products
      prisma.$queryRaw<ProductCountResult[]>`
        SELECT "productId" AS product_id, COUNT(*)::bigint AS count
        FROM "FavoriteAction"
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
        AND action = 'add'
        GROUP BY "productId"
        ORDER BY count DESC
        LIMIT 10
      `,
      // Conversions by type (исключаем конверсии, привязанные к заказам тестового пользователя)
      prisma.$queryRaw<ConversionCountResult[]>`
        SELECT c.type, COUNT(*)::bigint AS count
        FROM "Conversion" c
        LEFT JOIN "Order" o ON o.id = c."orderId"
        WHERE c."createdAt" >= ${cutoff} AND c."createdAt" <= ${now}
          AND (c."orderId" IS NULL OR o.email <> ${TEST_USER_EMAIL})
        GROUP BY c.type
      `,
      // Engaged users (those who added to cart OR favorites)
      prisma.$queryRaw<[CountResult]>`
        SELECT COUNT(DISTINCT user_id)::bigint AS count FROM (
          SELECT "userId" AS user_id FROM "CartAction"
          WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
          AND action = 'add' AND "userId" IS NOT NULL
          UNION
          SELECT "userId" AS user_id FROM "FavoriteAction"
          WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${now}
          AND action = 'add'
        ) engaged
      `,
    ]);

    // Извлекаем значения
    const totalViews = Number(viewsTotal[0]?.count ?? 0);
    const uniqueViewers = Number(viewsUniqueUsers[0]?.count ?? 0);
    const totalCartAdds = Number(cartAddsTotal[0]?.count ?? 0);
    const uniqueCartUsers = Number(cartUniqueUsers[0]?.count ?? 0);
    const totalFavoriteAdds = Number(favoritesAddsTotal[0]?.count ?? 0);
    const uniqueFavoriteUsers = Number(favoritesUniqueUsers[0]?.count ?? 0);
    const totalEngagedUsers = Number(engagedUsers[0]?.count ?? 0);

    // Конверсии
    const conversionsMap = new Map(conversionsCounts.map((c) => [c.type, Number(c.count)]));
    const viewToCart = conversionsMap.get("view_to_cart") ?? 0;
    const cartToOrder = conversionsMap.get("cart_to_order") ?? 0;
    const viewToOrder = conversionsMap.get("view_to_order") ?? 0;

    // Рассчитываем rates
    const viewToCartRate = totalViews > 0 ? Math.round((viewToCart / totalViews) * 10000) / 100 : 0;
    const cartToOrderRate =
      totalCartAdds > 0 ? Math.round((cartToOrder / totalCartAdds) * 10000) / 100 : 0;
    const engagementRate =
      uniqueViewers > 0 ? Math.round((totalEngagedUsers / uniqueViewers) * 10000) / 100 : 0;

    return {
      views: {
        total: totalViews,
        uniqueUsers: uniqueViewers,
        topProducts: viewsTopProducts.map((p) => ({
          productId: p.product_id,
          count: Number(p.count),
        })),
      },
      cart: {
        totalAdds: totalCartAdds,
        uniqueUsers: uniqueCartUsers,
        topProducts: cartTopProducts.map((p) => ({
          productId: p.product_id,
          count: Number(p.count),
        })),
      },
      favorites: {
        totalAdds: totalFavoriteAdds,
        uniqueUsers: uniqueFavoriteUsers,
        topProducts: favoritesTopProducts.map((p) => ({
          productId: p.product_id,
          count: Number(p.count),
        })),
      },
      conversions: {
        viewToCart,
        cartToOrder,
        viewToOrder,
        viewToCartRate,
        cartToOrderRate,
      },
      engagement: {
        rate: engagementRate,
        engagedUsers: totalEngagedUsers,
        totalViewers: uniqueViewers,
      },
    };
  } catch {
    // Fallback на нулевые значения
    return {
      views: { total: 0, uniqueUsers: 0, topProducts: [] },
      cart: { totalAdds: 0, uniqueUsers: 0, topProducts: [] },
      favorites: { totalAdds: 0, uniqueUsers: 0, topProducts: [] },
      conversions: {
        viewToCart: 0,
        cartToOrder: 0,
        viewToOrder: 0,
        viewToCartRate: 0,
        cartToOrderRate: 0,
      },
      engagement: { rate: 0, engagedUsers: 0, totalViewers: 0 },
    };
  }
}
