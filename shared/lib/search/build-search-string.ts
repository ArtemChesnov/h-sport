import { DTO } from "@/shared/services";
import { CATALOG_DEFAULT_PER_PAGE } from "@/shared/constants";

export type ProductsSearchParams = DTO.ProductsQueryDto & {
  q?: string;
};

/**
 * Собирает query-строку для продуктов на основе параметров.
 */
export function buildSearchString(params: ProductsSearchParams): string {
  const sp = new URLSearchParams();

  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.perPage && params.perPage !== CATALOG_DEFAULT_PER_PAGE)
    sp.set("perPage", String(params.perPage));

  // Категории (множественные)
  if (params.categorySlug) {
    if (Array.isArray(params.categorySlug)) {
      params.categorySlug.forEach((slug) => sp.append("categorySlug", slug));
    } else {
      sp.set("categorySlug", params.categorySlug);
    }
  }

  if (params.sort && params.sort !== "new") sp.set("sort", params.sort);

  if (params.q && params.q.trim()) sp.set("q", params.q.trim());

  // Фильтры
  if (params.priceFrom) sp.set("priceFrom", String(params.priceFrom));
  if (params.priceTo) sp.set("priceTo", String(params.priceTo));

  // Размеры (множественные)
  if (params.size) {
    if (Array.isArray(params.size)) {
      params.size.forEach((s) => sp.append("size", s));
    } else {
      sp.set("size", params.size);
    }
  }

  // Цвета (множественные)
  if (params.color) {
    if (Array.isArray(params.color)) {
      params.color.forEach((c) => sp.append("color", c));
    } else {
      sp.set("color", params.color);
    }
  }

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}
