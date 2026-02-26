/**
 * Универсальный парсер query-параметров каталога
 * Используется и на клиенте, и на сервере для единообразия
 */

import { z } from "zod";
import type { DTO } from "@/shared/services";

/** Доступные размеры */
export const VALID_SIZES: DTO.SizeDto[] = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "ONE_SIZE"];

/** Доступные варианты сортировки */
export const VALID_SORT_OPTIONS = ["price_asc", "price_desc", "new", "popular"] as const;
export type SortOption = (typeof VALID_SORT_OPTIONS)[number];

/** Доступные режимы отображения */
export const VALID_VIEW_MODES = ["mosaic", "grid-2"] as const;
export type ViewMode = (typeof VALID_VIEW_MODES)[number];

/**
 * Zod схема для query-параметров каталога
 */
export const catalogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  perPage: z.coerce.number().int().positive().max(100).optional(),
  sort: z.enum(VALID_SORT_OPTIONS).optional(),
  categorySlug: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  size: z.array(z.enum(VALID_SIZES as unknown as [string, ...string[]])).optional(),
  priceFrom: z.coerce.number().positive().optional(),
  priceTo: z.coerce.number().positive().optional(),
  q: z.string().max(100).optional(),
  sku: z.string().optional(),
  view: z.enum(VALID_VIEW_MODES).optional(),
});

export type CatalogQueryParams = z.infer<typeof catalogQuerySchema>;

/**
 * Интерфейс для источника query-параметров
 * Позволяет работать как с URLSearchParams, так и с Next.js searchParams
 */
interface QueryParamsSource {
  get(key: string): string | null;
  getAll(key: string): string[];
}

/**
 * Парсит query-параметры каталога из любого источника
 *
 * @param params - Источник параметров (URLSearchParams, ReadonlyURLSearchParams, или объект)
 * @returns Распарсенные и валидированные параметры
 */
export function parseCatalogQuery(params: QueryParamsSource): CatalogQueryParams {
  const rawParams: Record<string, unknown> = {};

  // Page
  const pageParam = params.get("page");
  if (pageParam) {
    const page = Number(pageParam);
    if (Number.isFinite(page) && page > 0) {
      rawParams.page = page;
    }
  }

  // PerPage
  const perPageParam = params.get("perPage");
  if (perPageParam) {
    const perPage = Number(perPageParam);
    if (Number.isFinite(perPage) && perPage > 0) {
      rawParams.perPage = perPage;
    }
  }

  // Sort
  const sortParam = params.get("sort");
  if (sortParam && VALID_SORT_OPTIONS.includes(sortParam as SortOption)) {
    rawParams.sort = sortParam;
  }

  // Category slugs (множественные)
  const categorySlugs = params.getAll("categorySlug").filter(Boolean);
  if (categorySlugs.length > 0) {
    rawParams.categorySlug = categorySlugs;
  }

  // Colors (множественные)
  const colors = params.getAll("color").filter(Boolean);
  if (colors.length > 0) {
    rawParams.color = colors;
  }

  // Sizes (множественные)
  const sizes = params.getAll("size").filter((s) => VALID_SIZES.includes(s as DTO.SizeDto));
  if (sizes.length > 0) {
    rawParams.size = sizes;
  }

  // Price range
  const priceFromParam = params.get("priceFrom");
  if (priceFromParam) {
    const priceFrom = Number(priceFromParam);
    if (Number.isFinite(priceFrom) && priceFrom > 0) {
      rawParams.priceFrom = priceFrom;
    }
  }

  const priceToParam = params.get("priceTo");
  if (priceToParam) {
    const priceTo = Number(priceToParam);
    if (Number.isFinite(priceTo) && priceTo > 0) {
      rawParams.priceTo = priceTo;
    }
  }

  // Search query
  const q = params.get("q")?.trim();
  if (q && q.length <= 100) {
    rawParams.q = q;
  }

  // SKU
  const sku = params.get("sku");
  if (sku) {
    rawParams.sku = sku;
  }

  // View mode
  const viewParam = params.get("view");
  if (viewParam && VALID_VIEW_MODES.includes(viewParam as ViewMode)) {
    rawParams.view = viewParam as ViewMode;
  }

  // Валидация через Zod (безопасный парсинг)
  const result = catalogQuerySchema.safeParse(rawParams);
  return result.success ? result.data : {};
}

/**
 * Проверяет, есть ли активные фильтры (кроме page и view)
 */
export function hasActiveFilters(query: CatalogQueryParams): boolean {
  return !!(
    (query.categorySlug && query.categorySlug.length > 0) ||
    query.priceFrom ||
    query.priceTo ||
    (query.size && query.size.length > 0) ||
    (query.color && query.color.length > 0) ||
    query.sort ||
    query.q
  );
}

/**
 * Конвертирует CatalogQueryParams в DTO.ProductsQueryDto
 */
export function toProductsQueryDto(params: CatalogQueryParams): DTO.ProductsQueryDto {
  const query: DTO.ProductsQueryDto = {};

  if (params.page) query.page = params.page;
  if (params.perPage) query.perPage = params.perPage;
  if (params.sort) query.sort = params.sort;
  if (params.categorySlug) query.categorySlug = params.categorySlug;
  if (params.color) query.color = params.color;
  if (params.size) query.size = params.size as DTO.SizeDto[];
  if (params.priceFrom) query.priceFrom = params.priceFrom;
  if (params.priceTo) query.priceTo = params.priceTo;
  if (params.q) query.q = params.q;

  return query;
}

/**
 * Генерирует URL query string из параметров каталога
 */
export function buildCatalogQueryString(
  params: Partial<CatalogQueryParams>,
  options?: { excludePage?: boolean }
): string {
  const searchParams = new URLSearchParams();

  // Page (если не исключён и не равен 1)
  if (!options?.excludePage && params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  // PerPage (если отличается от дефолта)
  if (params.perPage) {
    searchParams.set("perPage", String(params.perPage));
  }

  // Sort
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  // Category slugs
  params.categorySlug?.forEach((slug) => {
    searchParams.append("categorySlug", slug);
  });

  // Colors
  params.color?.forEach((color) => {
    searchParams.append("color", color);
  });

  // Sizes
  params.size?.forEach((size) => {
    searchParams.append("size", size);
  });

  // Price range
  if (params.priceFrom) {
    searchParams.set("priceFrom", String(params.priceFrom));
  }
  if (params.priceTo) {
    searchParams.set("priceTo", String(params.priceTo));
  }

  // Search query
  if (params.q) {
    searchParams.set("q", params.q);
  }

  // View mode
  if (params.view && params.view !== "mosaic") {
    searchParams.set("view", params.view);
  }

  return searchParams.toString();
}
