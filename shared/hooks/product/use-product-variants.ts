/**
 * Хук для управления выбором вариантов товара (цвет, размер)
 *
 * Логика:
 * - Выбор пользователя (selectedColor, selectedSize)
 * - Эффективные значения (effectiveColor, effectiveSize) с fallback на первый доступный
 * - Выбранный вариант (selectedItem) с приоритетом: точное совпадение > доступный > первый
 * - Изображения товара (из product.images + selectedItem.imageUrls)
 */

import { useMemo, useState } from "react";
import { DTO } from "@/shared/services";

type ProductItems = DTO.ProductDetailDto["items"];

type UseProductVariantsProps = {
  product?: DTO.ProductDetailDto | null;
};

type UseProductVariantsReturn = {
  // Выбор пользователя
  selectedColor: string | null;
  selectedSize: string | null;
  setSelectedColor: (color: string | null) => void;
  setSelectedSize: (size: string | null) => void;

  // Доступные варианты
  availableColors: string[];
  availableSizes: string[];

  // Эффективные значения (с fallback)
  effectiveColor: string;
  effectiveSize: string;

  // Выбранный вариант товара
  selectedItem: ProductItems[number] | null;

  // Изображения товара
  images: string[];
};

export function useProductVariants({
  product,
}: UseProductVariantsProps): UseProductVariantsReturn {
  // Выбор пользователя
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Доступные варианты
  const availableColors = useMemo(() => product?.colors ?? [], [product?.colors]);
  const availableSizes = useMemo(
    () => (product?.sizes ?? []).map((s) => String(s)),
    [product?.sizes],
  );

  // Эффективные значения (с fallback на первый доступный)
  const effectiveColor = useMemo(
    () =>
      selectedColor && availableColors.includes(selectedColor)
        ? selectedColor
        : (availableColors[0] ?? ""),
    [selectedColor, availableColors],
  );

  const effectiveSize = useMemo(
    () =>
      selectedSize && availableSizes.includes(selectedSize)
        ? selectedSize
        : (availableSizes[0] ?? ""),
    [selectedSize, availableSizes],
  );

  // Выбранный вариант товара
  const selectedItem = useMemo(() => {
    if (!product?.items) return null;

    // 1) точное совпадение цвет + размер (доступный вариант)
    if (effectiveColor && effectiveSize) {
      const exactAvailable = product.items.find(
        (x) =>
          x.color === effectiveColor &&
          String(x.size) === String(effectiveSize) &&
          x.isAvailable,
      );
      if (exactAvailable) return exactAvailable;

      // Если точного совпадения нет, но есть точное совпадение (недоступное), не возвращаем его
      // Переходим к следующему шагу
    }

    // 2) любой доступный вариант
    const available = product.items.find((x) => x.isAvailable);
    if (available) return available;

    // 3) fallback: первый вариант (даже если недоступен)
    return product.items[0] ?? null;
  }, [effectiveColor, effectiveSize, product]);

  // Изображения товара (из product.images + selectedItem.imageUrls)
  const images = useMemo(() => {
    if (!product) return [];
    const fromProduct = product.images ?? [];
    const fromItem = selectedItem?.imageUrls ?? [];
    return Array.from(new Set([...fromProduct, ...fromItem])).filter(
      (img): img is string => Boolean(img),
    );
  }, [product, selectedItem]);

  return {
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    availableColors,
    availableSizes,
    effectiveColor,
    effectiveSize,
    selectedItem,
    images,
  };
}
