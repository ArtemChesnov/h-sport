/**
 * Экспорты модуля продуктов
 */

// Типы и утилиты для работы со списком продуктов
export {
    buildProductsWhere, getProductsCacheKey, getProductsWithMaxPrice, getProductsWithMinPrice, mapProductsToListDto, paginateProducts, sortProducts, type ParsedProductsQuery, type ProductWithRelations
} from "./products.lib";

// Утилиты для популярности
export {
    getProductIdsSortedByPopularity, getProductsPopularityMap,
    getProductsSortedByPopularity
} from "./popularity.lib";

// Маппинг для детальной страницы
export { mapProductToDetailDto, type ProductDetailWithRelations } from "./product-detail.lib";

// Утилиты для slug
export { ensureUniqueSlug } from "./slug-utils";

// Парсинг query-параметров
export { parseProductsQuery } from "./validation.lib";
