import { SizeDto } from "../base.dto";

/**
 * Детальный вариант товара (ProductItem)
 * для карточки товара.
 */
export type ProductItemDetailDto = {
  id: number;
  sku: string;

  color: string;
  size: SizeDto;

  price: number;
  isAvailable: boolean;
  imageUrls: string[];
};

// Детальная карточка товара для страницы /shop/product/[id]
export type ProductDetailDto = {
  id: number;
  slug: string;
  name: string;
  sku: string;

  description: string | null;
  composition: string | null;

  images: string[]; // общая галерея товара
  tags: string[]; // список тегов

  categoryId: number;
  categorySlug: string;
  categoryName: string;

  // Комплект ли это (топ+леггинсы и т.п.)
  isSet: boolean;

  /**
   * Агрегаты по цене:
   * - price     — базовая цена (минимальная среди вариантов, удобно использовать в выводе)
   * - priceMin  — минимальная цена
   * - priceMax  — максимальная цена (задел на будущее, если варианты будут отличаться)
   */
  price: number;
  priceMin: number;
  priceMax: number;

  /**
   * Множество доступных значений для фильтров и UI.
   */
  colors: string[];
  sizes: SizeDto[];

  /**
   * Список конкретных вариантов (цвет+размер+цена+наличие).
   */
  items: ProductItemDetailDto[];
};
