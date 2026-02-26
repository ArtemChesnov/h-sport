/**
 * Парсинг и валидация query-параметров каталога товаров
 */

import { CATALOG_DEFAULT_PER_PAGE, CATALOG_MAX_PER_PAGE } from "@/shared/constants";
import { normalizePaginationParams, validateSearchQuery } from "@/shared/lib";
import { DTO } from "@/shared/services";
import type { NextRequest } from "next/server";

/**
 * Нормализованные query-параметры каталога:
 * с дефолтами и приведёнными типами.
 */
export type ParsedProductsQuery = {
  page: number;
  perPage: number;

  categorySlug?: string[];
  color?: string[]; // множественный выбор цветов
  size?: DTO.SizeDto[];
  priceFrom?: number;
  priceTo?: number;

  sku?: string;
  q?: string; // общий поиск (name/slug/SKU)

  sort: DTO.ProductsQueryDto["sort"];
};

/**
 * Парсит query-параметры из NextRequest → ParsedProductsQuery.
 *
 * Здесь живёт вся логика:
 *  - дефолтные значения;
 *  - валидация;
 *  - приведение типов.
 */
export function parseProductsQuery(request: NextRequest): ParsedProductsQuery {
  const { searchParams } = new URL(request.url);

  // Пагинация. Дефолт должен совпадать с getInitialCatalogProducts на странице каталога.
  const { page, perPage } = normalizePaginationParams(
    searchParams.get("page"),
    searchParams.get("perPage"),
    CATALOG_MAX_PER_PAGE,
    CATALOG_DEFAULT_PER_PAGE,
  );

  // Фильтры.
  const categorySlugs = searchParams.getAll("categorySlug").filter(Boolean);
  const categorySlug = categorySlugs.length > 0 ? categorySlugs : undefined;

  // Множественный выбор цветов
  const colorParams = searchParams.getAll("color").filter(Boolean);
  const color = colorParams.length > 0 ? colorParams : undefined;

  const sizeRaws = searchParams.getAll("size");
  const validSizes: DTO.SizeDto[] = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "ONE_SIZE"];
  const sizes = sizeRaws.filter((s) => validSizes.includes(s as DTO.SizeDto)) as DTO.SizeDto[];
  const size = sizes.length > 0 ? sizes : undefined;

  // Сортировка.
  type SortParam = NonNullable<DTO.ProductsQueryDto["sort"]>;
  const sortRaw = searchParams.get("sort");
  const allowedSort: SortParam[] = ["price_asc", "price_desc", "new", "popular"];
  const sort: SortParam = allowedSort.includes(sortRaw as SortParam)
    ? (sortRaw as SortParam)
    : "new";

  // Цены (в копейках).
  const priceFromParam = searchParams.get("priceFrom");
  const priceToParam = searchParams.get("priceTo");
  const priceFrom = priceFromParam ? Number(priceFromParam) : undefined;
  const priceTo = priceToParam ? Number(priceToParam) : undefined;

  // sku.
  const sku = searchParams.get("sku") || undefined;
  // Валидация и ограничение длины поискового запроса
  const qRaw = validateSearchQuery(searchParams.get("q"));
  const q = qRaw || undefined;

  return {
    page,
    perPage,
    categorySlug,
    color,
    size,
    priceFrom,
    priceTo,
    sku,
    q,
    sort,
  };
}
