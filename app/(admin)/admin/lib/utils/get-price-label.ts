
import { formatPrice } from "./format-price";

/**
 * Хелпер: строка для диапазона цен (в копейках).
 */
export function getPriceLabel(
  priceMin: number | null | undefined,
  priceMax: number | null | undefined,
): string {
  const min = priceMin ?? null;
  const max = priceMax ?? null;

  if (min === null && max === null) {
    return "—";
  }

  if (min !== null && max !== null) {
    if (min === max) {
      return `${formatPrice(min)} ₽`;
    }
    return `${formatPrice(min)}–${formatPrice(max)} ₽`;
  }

  if (min !== null) {
    return `${formatPrice(min)} ₽`;
  }

  if (max !== null) {
    return `${formatPrice(max)} ₽`;
  }

  return "—";
}
