/**
 * Фасад для e-commerce метрик
 *
 * Рефакторинг: код разбит на модули:
 * - ecommerce-metrics-types.ts - типы и интерфейсы
 * - ecommerce-metrics-storage.ts - хранилище в памяти
 * - ecommerce-metrics-writers.ts - запись метрик в БД
 * - ecommerce-metrics-readers.ts - чтение метрик из БД
 * - ecommerce-metrics-aggregation.ts - агрегация и вычисления
 * - ecommerce-metrics-cleanup.ts - очистка старых метрик
 *
 * Этот файл экспортирует публичные функции для записи и получения метрик
 */

import { createSafeInterval } from "../safe-interval";
import {
    aggregateCart,
    aggregateConversions,
    aggregateFavorites,
    aggregateViews,
    calculateEngagementRate,
} from "./ecommerce-metrics-aggregation";
import { loadMetricsFromDb, getAggregatedMetricsFromDb } from "./ecommerce-metrics-readers";

// Реэкспорт функций записи
export {
    recordCartAction, recordConversion, recordFavoriteAction, recordProductView
} from "./ecommerce-metrics-writers";

// Реэкспорт функций очистки
export {
    clearOldEcommerceMetrics,
    clearOldEcommerceMetricsFromDb
} from "./ecommerce-metrics-cleanup";

// Реэкспорт функции агрегации из БД
export { getAggregatedEcommerceMetrics } from "./ecommerce-metrics-aggregation-db";

/** Порог для использования оптимизированной агрегации (7 дней в мс) */
const AGGREGATION_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Получает статистику по e-commerce метрикам
 *
 * Для коротких периодов (<= 7 дней) загружает записи и агрегирует в памяти
 * Для длинных периодов (> 7 дней) использует агрегацию на уровне БД
 */
export async function getEcommerceMetrics(timeWindowMs: number = 24 * 60 * 60 * 1000) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - timeWindowMs);

  // Для длинных периодов используем оптимизированную агрегацию на уровне БД
  if (timeWindowMs > AGGREGATION_THRESHOLD_MS) {
    const aggregated = await getAggregatedMetricsFromDb(cutoff, now);

    return {
      period: {
        from: cutoff.toISOString(),
        to: now.toISOString(),
        windowMs: timeWindowMs,
      },
      views: aggregated.views,
      cart: aggregated.cart,
      favorites: aggregated.favorites,
      engagement: aggregated.engagement,
      conversions: aggregated.conversions,
    };
  }

  // Для коротких периодов загружаем записи
  const { views: recentViews, cartActions: recentCartActions, favorites: recentFavorites, conversions: recentConversions } =
    await loadMetricsFromDb(cutoff, now);

  // Агрегируем данные
  const viewsStats = aggregateViews(recentViews);
  const cartStats = aggregateCart(recentCartActions);
  const favoritesStats = aggregateFavorites(recentFavorites);

  const cartAdds = recentCartActions.filter((a) => a.action === "add");
  const conversionsStats = aggregateConversions(recentConversions, viewsStats.total, cartAdds.length);

  // Уникальные пользователи для engagement rate
  const uniqueViewers = new Set(recentViews.map((v) => v.userId).filter((id): id is string => Boolean(id)));
  const uniqueCartUsers = new Set(cartAdds.map((a) => a.userId).filter((id): id is string => Boolean(id)));
  const favoriteAdds = recentFavorites.filter((f) => f.action === "add");
  const uniqueFavoriteUsers = new Set(favoriteAdds.map((f) => f.userId));

  const engagementRate = calculateEngagementRate(uniqueViewers, uniqueCartUsers, uniqueFavoriteUsers);
  const engagedUsers = new Set([...uniqueCartUsers, ...uniqueFavoriteUsers]);

  return {
    period: {
      from: cutoff.toISOString(),
      to: now.toISOString(),
      windowMs: timeWindowMs,
    },
    views: {
      total: viewsStats.total,
      uniqueUsers: viewsStats.uniqueUsers,
      topProducts: viewsStats.topProducts,
    },
    cart: {
      totalAdds: cartStats.totalAdds,
      uniqueUsers: cartStats.uniqueUsers,
      topProducts: cartStats.topProducts,
    },
    favorites: {
      totalAdds: favoritesStats.totalAdds,
      uniqueUsers: favoritesStats.uniqueUsers,
      topProducts: favoritesStats.topProducts,
    },
    engagement: {
      rate: engagementRate,
      engagedUsers: engagedUsers.size,
      totalViewers: uniqueViewers.size,
    },
    conversions: conversionsStats,
  };
}

// Инициализация периодической очистки метрик
createSafeInterval(async () => {
  const { clearOldEcommerceMetrics } = await import("./ecommerce-metrics-cleanup");
  clearOldEcommerceMetrics();
}, 24 * 60 * 60 * 1000, "ecommerce-metrics:cleanup");

// Периодическая очистка старых метрик из БД (раз в день)
createSafeInterval(async () => {
  const { clearOldEcommerceMetricsFromDb } = await import("./ecommerce-metrics-cleanup");
  clearOldEcommerceMetricsFromDb(30).catch(() => {
    // Игнорируем ошибки
  });
}, 24 * 60 * 60 * 1000, "ecommerce-metrics:db-cleanup");

