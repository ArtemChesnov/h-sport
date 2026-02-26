/**
 * Утилиты для анализа брошенных корзин
 * Отделяет бизнес-логику от UI
 */

export interface AbandonedCartHour {
  hour: number;
  count: number;
}

export interface TopAbandonedProduct {
  id: number;
  name: string;
  slug: string;
  count: number;
}

/**
 * Находит час с максимальным количеством брошенных корзин
 */
export function getTopHour(byHour: AbandonedCartHour[]): number | null {
  if (!byHour || byHour.length === 0) return null;

  return byHour.reduce((max, h) => (h.count > max.count ? h : max), byHour[0]).hour;
}

/**
 * Форматирует час для отображения
 */
export function formatHour(hour: number | null): string {
  return hour !== null ? `${hour}:00` : "—";
}

/**
 * Рассчитывает средний размер корзины
 */
export function calculateAverageCartSize(
  totalItems: number,
  totalCarts: number
): number {
  if (totalCarts === 0) return 0;
  return Math.round((totalItems / totalCarts) * 100) / 100;
}

/**
 * Рассчитывает процент брошенных корзин
 */
export function calculateAbandonedCartRate(
  abandonedCarts: number,
  totalCarts: number
): number {
  if (totalCarts === 0) return 0;
  return Math.round((abandonedCarts / totalCarts) * 100 * 100) / 100;
}
