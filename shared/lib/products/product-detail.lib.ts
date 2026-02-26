/**
 * Маппинг продукта в детальную DTO
 */

import { DTO } from "@/shared/services";
import type { Prisma } from "@prisma/client";

/**
 * Продукт с нужными связями:
 * - Product
 * - Category
 * - ProductItem[]
 *
 * Оптимизация: используем select вместо include для меньшего объема данных
 */
export type ProductDetailWithRelations = Prisma.ProductGetPayload<{
  select: {
    id: true;
    slug: true;
    name: true;
    description: true;
    composition: true;
    images: true;
    tags: true;
    categoryId: true;
    category: {
      select: {
        id: true;
        slug: true;
        name: true;
      };
    };
    items: {
      select: {
        id: true;
        sku: true;
        color: true;
        size: true;
        price: true;
        isAvailable: true;
        imageUrls: true;
      };
    };
  };
}>;

/**
 * Маппинг Product (Prisma) → ProductDetailDto (фронт).
 *
 * Здесь:
 * - выбираем базовый набор вариантов (доступные, иначе все);
 * - считаем цены (min / max / базовая);
 * - собираем цвета и размеры;
 * - собираем галерею;
 * - определяем, является ли товар комплектом;
 * - формируем список вариантов.
 */
export function mapProductToDetailDto(product: ProductDetailWithRelations): DTO.ProductDetailDto {
  const items = product.items;

  if (!items || items.length === 0) {
    // Защита от кривых данных: товар без вариантов.
    throw new Error(`Product(id=${product.id}, slug=${product.slug}) has no items`);
  }

  // --- 1. Базовый набор вариантов для расчётов ---

  const availableItems = items.filter((item) => item.isAvailable);
  const baseItems = availableItems.length > 0 ? availableItems : items;

  // --- 2. Цены ---

  const prices = baseItems.map((item) => item.price);
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);
  const price = priceMin; // базовая цена "от ..."

  // --- 3. Цвета и размеры ---

  const colors = Array.from(new Set(baseItems.map((item) => item.color)));
  const sizes = Array.from(new Set(baseItems.map((item) => item.size))) as DTO.SizeDto[];

  // --- 4. Галерея товара ---

  let images: string[] = [];

  if (product.images && product.images.length > 0) {
    images = product.images;
  } else {
    const fromItems = product.items.flatMap((item) => item.imageUrls ?? []);
    images = Array.from(new Set(fromItems));
  }

  // --- 5. Комплект или нет ---

  const isSet = product.category.slug === "top-leggings-sets";

  // --- 6. Варианты товара ---

  const detailedItems: DTO.ProductItemDetailDto[] = product.items.map((item) => ({
    id: item.id,
    sku: item.sku ?? "",
    color: item.color,
    size: item.size as DTO.SizeDto,
    price: item.price,
    isAvailable: item.isAvailable,
    imageUrls: item.imageUrls ?? [],
  }));

  // sku на уровне товара — берём sku из базового набора
  const itemWithSku = baseItems.find((item) => !!item.sku) ?? baseItems[0];
  const sku = itemWithSku?.sku ?? "";

  // --- 7. Финальная DTO ---

  const dto: DTO.ProductDetailDto = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku,

    description: product.description ?? null,
    composition: product.composition ?? null,

    images,
    tags: product.tags ?? [],

    categoryId: product.categoryId,
    categorySlug: product.category.slug,
    categoryName: product.category.name,

    isSet,

    price,
    priceMin,
    priceMax,

    colors,
    sizes,

    items: detailedItems,
  };

  return dto;
}
