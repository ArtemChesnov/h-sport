/**
 * Функции для очистки старых e-commerce метрик
 */

import {
  productViews,
  cartActions,
  favoriteActions,
  conversions,
} from "./ecommerce-metrics-storage";
import { METRICS_MEMORY_RETENTION_MS, METRICS_DB_RETENTION_DAYS } from "@/shared/constants";

/**
 * Очищает старые метрики из памяти
 */
export function clearOldEcommerceMetrics(olderThanMs: number = METRICS_MEMORY_RETENTION_MS): void {
  const cutoff = Date.now() - olderThanMs;

  // Очищаем просмотры
  const viewsIndex = productViews.findIndex((v) => v.timestamp >= cutoff);
  if (viewsIndex > 0) {
    productViews.splice(0, viewsIndex);
  }

  // Очищаем действия с корзиной
  const cartIndex = cartActions.findIndex((a) => a.timestamp >= cutoff);
  if (cartIndex > 0) {
    cartActions.splice(0, cartIndex);
  }

  // Очищаем избранное
  const favIndex = favoriteActions.findIndex((f) => f.timestamp >= cutoff);
  if (favIndex > 0) {
    favoriteActions.splice(0, favIndex);
  }

  // Очищаем конверсии
  const convIndex = conversions.findIndex((c) => c.timestamp >= cutoff);
  if (convIndex > 0) {
    conversions.splice(0, convIndex);
  }
}

/**
 * Очищает старые e-commerce метрики из БД
 */
export async function clearOldEcommerceMetricsFromDb(olderThanDays: number = METRICS_DB_RETENTION_DAYS): Promise<void> {
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    await Promise.all([
      prisma.productView.deleteMany({
        where: {
          createdAt: {
            lt: cutoff,
          },
        },
      }),
      prisma.cartAction.deleteMany({
        where: {
          createdAt: {
            lt: cutoff,
          },
        },
      }),
      prisma.favoriteAction.deleteMany({
        where: {
          createdAt: {
            lt: cutoff,
          },
        },
      }),
      prisma.conversion.deleteMany({
        where: {
          createdAt: {
            lt: cutoff,
          },
        },
      }),
    ]);
  } catch {
    // Игнорируем ошибки БД
  }
}
