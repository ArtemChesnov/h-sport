import { SizeDto } from "../base.dto";

/**
 * Параметры, которые фронт передаёт в GET /api/shop/products.
 *
 * Все поля опциональные — можно передавать только нужные.
 */
export type ProductsQueryDto = {
  page?: number; // номер страницы (1 по умолчанию)
  perPage?: number; // количество товаров на странице

  /**
   * Общий поиск:
   *  - по названию товара;
   *  - по slug;
   *  - по SKU вариантов.
   */
  q?: string;

  /**
   * Фильтр по конкретному идентификатору варианта (SKU).
   * Можно использовать для точного поиска по одному SKU.
   */
  sku?: string;

  categorySlug?: string | string[]; // фильтр по категории (может быть массивом)
  priceFrom?: number; // цена "от" в копейках
  priceTo?: number; // цена "до" в копейках
  size?: SizeDto | SizeDto[]; // фильтр по размеру (может быть массивом)
  color?: string | string[]; // фильтр по цвету (может быть массивом)

  /**
   * Сортировка:
   *  - price_asc  — по цене ↑;
   *  - price_desc — по цене ↓;
   *  - new        — новинки;
   *  - popular    — популярные (по количеству продаж).
   */
  sort?: "price_asc" | "price_desc" | "new" | "popular";
};
