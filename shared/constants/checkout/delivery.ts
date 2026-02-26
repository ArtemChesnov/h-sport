/**
 * Константы для доставки
 */

/**
 * Стоимость доставки по умолчанию (в копейках)
 * Можно переопределить через ENV переменную DELIVERY_FEE_KOPECKS
 */
export const DEFAULT_DELIVERY_FEE =
  parseInt(process.env.DELIVERY_FEE_KOPECKS || "", 10) || 300_00; // 300 рублей

/**
 * Порог суммы заказа для бесплатной доставки (в копейках).
 * При (subtotal - discount) >= этого значения доставка не начисляется.
 * 10_000_00 = 10 000 ₽
 */
export const FREE_DELIVERY_THRESHOLD_KOPECKS = 10_000_00; // 10 000 рублей
