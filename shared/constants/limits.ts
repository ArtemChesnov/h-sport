/**
 * Константы для лимитов и ограничений
 * Используются для защиты от неограниченных выборок и перегрузки БД/памяти.
 */

/**
 * Максимальное количество товаров для in-memory сортировки в админке
 * Используется для сортировки по цене/популярности, когда нужно загрузить больше товаров
 * для корректной сортировки перед пагинацией
 */
export const MAX_PRODUCTS_FOR_IN_MEMORY_SORT = 500;

/**
 * Максимальное количество метрик для загрузки из БД за один запрос
 * Ограничивает объем данных для предотвращения перегрузки памяти
 */
export const MAX_METRICS_QUERY_LIMIT = 10000;

/**
 * Лимит выборки API-метрик из БД за один запрос (getApiMetrics, previous period).
 * При превышении данные обрезаются; в логах можно отслеживать truncation.
 */
export const API_METRICS_DB_QUERY_LIMIT = 20_000;

/**
 * Размер страницы при пагинации товаров в sitemap (за один запрос к БД).
 */
export const SITEMAP_PRODUCTS_PAGE_SIZE = 500;

/**
 * Максимальное количество категорий в sitemap (защита на будущее).
 */
export const SITEMAP_CATEGORIES_MAX = 200;

/**
 * Лимит корзин/заказов в выборке для расчёта abandoned cart rate (advanced metrics).
 */
export const ADVANCED_METRICS_CART_SAMPLE_LIMIT = 10_000;

/**
 * Лимит пользователей и заказов в выборке для user metrics (new/returning customers).
 */
export const ADVANCED_METRICS_USERS_ORDERS_LIMIT = 5_000;

/**
 * Лимит позиций заказов в выборке для метрик по категориям.
 */
export const ADVANCED_METRICS_ORDER_ITEMS_LIMIT = 20_000;

/**
 * Универсальный размер батча для product.findMany по ID.
 * Используется в getCategoryMetrics, product-performance и других сервисах,
 * чтобы не передавать в IN(…) тысячи id за раз.
 */
export const PRODUCT_IDS_BATCH_SIZE = 500;

/**
 * Мягкий лимит избранных товаров на одного пользователя (защита от раздувания запроса).
 */
export const FAVORITES_MAX_PER_USER = 500;

/**
 * Максимальный период для метрик (в днях)
 * Периоды больше этого значения требуют обязательную агрегацию на уровне БД
 */
export const MAX_METRICS_PERIOD_DAYS = 90;

/**
 * Период в днях, после которого переключаемся на агрегацию БД
 * Для коротких периодов (<= 7 дней) допускается загрузка записей
 */
export const METRICS_AGGREGATION_THRESHOLD_DAYS = 7;

/**
 * Максимальная длина поискового запроса (символов).
 * Используется в searchQuerySchema и API каталога.
 */
export const MAX_SEARCH_QUERY_LENGTH = 200;
