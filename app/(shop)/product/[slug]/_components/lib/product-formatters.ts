import { formatMoney } from "@/shared/lib/formatters";
import { DTO } from "@/shared/services";

/**
 * Утилиты для форматирования данных товара
 */
export function useProductFormatters(product: DTO.ProductDetailDto | undefined) {
  const priceLabel = product
    ? product.priceMin === product.priceMax
      ? formatMoney(product.priceMin)
      : `${formatMoney(product.priceMin)} — ${formatMoney(product.priceMax)}`
    : "";

  return {
    priceLabel,
  };
}

/**
 * Утилиты для работы с изображениями товара
 */
export function useProductImages(images: string[], activeImage: string | null) {
  const effectiveActiveImage =
    activeImage && images.includes(activeImage) ? activeImage : (images[0] ?? "");

  return {
    effectiveActiveImage,
  };
}
