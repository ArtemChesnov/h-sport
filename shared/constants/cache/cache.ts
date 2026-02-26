/**
 * Константы для кэширования и TTL
 */

import {
  FIFTEEN_MINUTES_MS,
  FIVE_MINUTES_MS,
  ONE_HOUR_MS,
  TEN_MINUTES_MS,
  THIRTY_MINUTES_MS,
} from "../time";

/**
 * TTL для кэша популярности товаров (5 минут)
 * Балансирует между актуальностью данных и производительностью
 */
export const POPULARITY_CACHE_TTL_MS = FIVE_MINUTES_MS;

/**
 * TTL для кэша пунктов выдачи (12 часов)
 * ПВЗ обновляются редко, поэтому можно кэшировать дольше
 */
export const PICKUP_POINTS_CACHE_TTL_MS = 12 * ONE_HOUR_MS;

/**
 * Revalidation интервал для ISR страниц каталога (5 минут)
 * Используется для Next.js ISR (Incremental Static Regeneration)
 */
export const CATALOG_REVALIDATE_SECONDS = FIVE_MINUTES_MS / 1000;

/**
 * TTL для кэша детальной страницы товара (30 минут)
 */
export const PRODUCT_SLUG_CACHE_TTL_MS = THIRTY_MINUTES_MS;

/**
 * TTL для метрик (5 минут)
 */
export const METRICS_CACHE_TTL_MS = FIVE_MINUTES_MS;

/**
 * TTL для retention метрик (10 минут)
 */
export const RETENTION_CACHE_TTL_MS = TEN_MINUTES_MS;

/**
 * TTL для кэша списка товаров (15 минут)
 */
export const PRODUCTS_LIST_CACHE_TTL_MS = FIFTEEN_MINUTES_MS;
