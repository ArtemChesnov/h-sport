/**
 * Утилиты для расчета эффективности промокодов
 */

export interface PromoMetrics {
  usageCount: number;
  totalDiscount: number;
  totalRevenue: number;
}

/**
 * Рассчитывает ROI промокода
 */
export function calculatePromoROI(metrics: PromoMetrics): number {
  if (metrics.totalDiscount === 0) {
    return metrics.totalRevenue > 0 ? 999 : 0; // Бесконечный ROI если скидка 0, но есть выручка
  }

  return Math.round(((metrics.totalRevenue - metrics.totalDiscount) / metrics.totalDiscount) * 100 * 100) / 100;
}

/**
 * Рассчитывает среднюю скидку на заказ
 */
export function calculateAverageDiscountPerOrder(metrics: PromoMetrics): number {
  if (metrics.usageCount === 0) return 0;
  return Math.round(metrics.totalDiscount / metrics.usageCount);
}

/**
 * Рассчитывает среднюю стоимость заказа с промокодом
 */
export function calculateAverageOrderValue(metrics: PromoMetrics): number {
  if (metrics.usageCount === 0) return 0;
  return Math.round(metrics.totalRevenue / metrics.usageCount);
}

/**
 * Рассчитывает процент использования промокодов
 */
export function calculatePromoUsageRate(
  ordersWithPromo: number,
  totalOrders: number
): number {
  if (totalOrders === 0) return 0;
  return Math.round((ordersWithPromo / totalOrders) * 100 * 100) / 100;
}
