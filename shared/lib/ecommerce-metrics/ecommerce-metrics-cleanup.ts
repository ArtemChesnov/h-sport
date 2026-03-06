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
export async function clearOldEcommerceMetricsFromDb(
  olderThanDays: number = METRICS_DB_RETENTION_DAYS
): Promise<void> {
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

/**
 * Очищает старые системные логи и метрики из БД.
 * ApiMetric, WebVitalsMetric, SlowQuery, ServerMetrics — retention 30 дней.
 * SecurityEvent, WebhookLog, ClientErrorLog — retention 90 дней.
 */
export async function clearOldSystemLogsFromDb(): Promise<void> {
  try {
    const { prisma } = await import("@/prisma/prisma-client");

    const shortRetentionCutoff = new Date();
    shortRetentionCutoff.setDate(shortRetentionCutoff.getDate() - 30);

    const longRetentionCutoff = new Date();
    longRetentionCutoff.setDate(longRetentionCutoff.getDate() - 90);

    await Promise.all([
      prisma.apiMetric.deleteMany({ where: { createdAt: { lt: shortRetentionCutoff } } }),
      prisma.webVitalsMetric.deleteMany({ where: { createdAt: { lt: shortRetentionCutoff } } }),
      prisma.slowQuery.deleteMany({ where: { createdAt: { lt: shortRetentionCutoff } } }),
      prisma.serverMetrics.deleteMany({ where: { createdAt: { lt: shortRetentionCutoff } } }),
      prisma.securityEvent.deleteMany({ where: { createdAt: { lt: longRetentionCutoff } } }),
      prisma.webhookLog.deleteMany({ where: { createdAt: { lt: longRetentionCutoff } } }),
      prisma.clientErrorLog.deleteMany({ where: { createdAt: { lt: longRetentionCutoff } } }),
    ]);
  } catch {
    // Игнорируем ошибки БД
  }
}
