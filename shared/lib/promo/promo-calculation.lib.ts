/**
 * Расчёт скидок промокодов
 */

import type { PromoType } from "@prisma/client";

/**
 * Расчёт скидки по промокоду.
 *
 * @param args.type - Тип промокода (PERCENT или AMOUNT)
 * @param args.value - Значение скидки (процент или сумма в копейках)
 * @param args.subtotal - Сумма заказа в копейках
 * @returns Размер скидки в копейках
 */
export function calculatePromoDiscount(args: {
  type: PromoType;
  value: number;
  subtotal: number;
}): number {
  const { type, value, subtotal } = args;

  if (subtotal <= 0) return 0;
  if (value <= 0) return 0;

  if (type === "PERCENT") {
    const raw = Math.round((subtotal * value) / 100);
    return Math.min(raw, subtotal);
  }

  // AMOUNT — value в копейках
  return Math.min(value, subtotal);
}
