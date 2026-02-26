import { formatMoney } from "@/shared/lib/formatters/format-money";

/**
 * Форматирует отображение скидки по промокоду для summary-карточек.
 * При отсутствии скидки или кода возвращает "не применялся".
 * При «круглом» проценте (5%, 10% и т.д.) возвращает "-N%", иначе сумму скидки.
 */
export function formatDiscountDisplay(
  subtotal: number,
  discount: number,
  appliedCode: string | null | undefined
): string {
  if (discount <= 0 || !appliedCode) {
    return "не применялся";
  }

  if (subtotal > 0) {
    const discountPercent = (discount / subtotal) * 100;
    const roundedPercent = Math.round(discountPercent);
    if (Math.abs(discountPercent - roundedPercent) < 0.1) {
      return `-${roundedPercent}%`;
    }
  }

  return `-${formatMoney(discount)}`;
}
