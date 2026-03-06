/**
 * Экспорты модуля продуктов
 */

// Типы и утилиты для работы со списком продуктов
export {
  buildCatalogCacheKey,
  buildProductsWhere,
  getProductsCacheKey,
  getProductsWithMaxPrice,
  getProductsWithMinPrice,
  mapProductsToListDto,
  paginateProducts,
  sortProducts,
  MAX_CATALOG_CACHE_KEY_LENGTH,
  MAX_SEARCH_LENGTH_FOR_CACHE,
  CATALOG_CACHE_VERSION_PREFIX,
  type ParsedProductsQuery,
  type ProductWithRelations,
} from "./products.lib";

// Утилиты для популярности
export {
  getProductIdsSortedByPopularity,
  getProductsPopularityMap,
  getProductsSortedByPopularity,
} from "./popularity.lib";

// Маппинг для детальной страницы
export { mapProductToDetailDto, type ProductDetailWithRelations } from "./product-detail.lib";

// Утилиты для slug
export { ensureUniqueSlug } from "./slug-utils";

// Парсинг query-параметров
export { parseProductsQuery } from "./validation.lib";
