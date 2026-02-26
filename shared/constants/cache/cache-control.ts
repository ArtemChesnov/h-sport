/**
 * Константы Cache-Control для API endpoints
 *
 * Используются в заголовках ответов для кэширования на CDN и в браузере.
 * s-maxage — кэш на CDN/прокси
 * stale-while-revalidate — отдача устаревшего контента во время фонового обновления
 */

import {
  FIVE_MINUTES_MS,
  ONE_DAY_MS,
  ONE_MINUTE_MS,
  SIX_HOURS_MS,
  TEN_MINUTES_MS,
  THIRTY_DAYS_MS,
  TWO_HOURS_MS,
} from "../time";

/** Продукты каталога: 1 мин s-maxage, 5 мин swr */
export const CACHE_CONTROL_PRODUCTS = `public, s-maxage=${ONE_MINUTE_MS / 1000}, stale-while-revalidate=${FIVE_MINUTES_MS / 1000}`;

/** Детальная страница товара (public): 2 ч s-maxage и swr. Private — 5 мин (не в заголовке, см. использование). */
export const CACHE_CONTROL_PRODUCT_SLUG = `public, s-maxage=${TWO_HOURS_MS / 1000}, stale-while-revalidate=${TWO_HOURS_MS / 1000}`;

/** Фильтры каталога (public): 6 ч s-maxage и swr. Private — 30 мин оставить при необходимости. */
export const CACHE_CONTROL_FILTERS = `public, s-maxage=${SIX_HOURS_MS / 1000}, stale-while-revalidate=${SIX_HOURS_MS / 1000}`;

/** Фильтры при ошибке: 1 мин fallback */
export const CACHE_CONTROL_FILTERS_ERROR = `public, s-maxage=${ONE_MINUTE_MS / 1000}, stale-while-revalidate=${FIVE_MINUTES_MS / 1000}`;

/** Категории (public): 1 день. Private — 7 дней оставить при необходимости. */
export const CACHE_CONTROL_CATEGORIES = `public, s-maxage=${ONE_DAY_MS / 1000}, stale-while-revalidate=${THIRTY_DAYS_MS / 1000}`;

/** Корзина: 10 сек (частые изменения) */
export const CACHE_CONTROL_CART = `private, s-maxage=10, stale-while-revalidate=30`;

/** Заказы пользователя: 1 мин */
export const CACHE_CONTROL_ORDERS = `private, s-maxage=${ONE_MINUTE_MS / 1000}, stale-while-revalidate=120`;

/** Избранное: 30 сек */
export const CACHE_CONTROL_FAVORITES = `private, s-maxage=30, stale-while-revalidate=60`;

/** Дашборд админки: 5 мин */
export const CACHE_CONTROL_ADMIN_DASHBOARD = `private, max-age=${FIVE_MINUTES_MS / 1000}`;

/** Бизнес-метрики: 5 мин */
export const CACHE_CONTROL_BUSINESS_METRICS = `private, max-age=${FIVE_MINUTES_MS / 1000}`;

/** Метрики retention: 10 мин */
export const CACHE_CONTROL_RETENTION = `private, max-age=${TEN_MINUTES_MS / 1000}`;

/** API docs / spec: 5 мин */
export const CACHE_CONTROL_API_DOCS = `public, max-age=${FIVE_MINUTES_MS / 1000}`;
