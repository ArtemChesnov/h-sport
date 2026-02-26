/**
 * Константы для временных интервалов (в миллисекундах)
 */

/** 1 минута */
export const ONE_MINUTE_MS = 60 * 1000;

/** 5 минут */
export const FIVE_MINUTES_MS = 5 * 60 * 1000;

/** 10 минут */
export const TEN_MINUTES_MS = 10 * 60 * 1000;

/** 15 минут */
export const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/** 30 минут */
export const THIRTY_MINUTES_MS = 30 * 60 * 1000;

/**
 * 1 час в миллисекундах
 */
export const ONE_HOUR_MS = 60 * 60 * 1000;

/** 2 часа */
export const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/** 6 часов */
export const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

/**
 * 1 день в миллисекундах
 */
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 7 дней в миллисекундах
 */
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 30 дней в миллисекундах
 */
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Интервал очистки кэша (5 минут)
 */
export const CACHE_CLEANUP_INTERVAL_MS = FIVE_MINUTES_MS;

/**
 * Интервал очистки rate limit store (5 минут)
 */
export const RATE_LIMIT_CLEANUP_INTERVAL_MS = FIVE_MINUTES_MS;

/**
 * Интервал очистки webhook защиты (1 час)
 */
export const WEBHOOK_CLEANUP_INTERVAL_MS = ONE_HOUR_MS;

/**
 * TTL для webhook защиты (24 часа)
 */
export const WEBHOOK_TTL_MS = ONE_DAY_MS;

/**
 * Период хранения метрик в памяти (7 дней)
 */
export const METRICS_MEMORY_RETENTION_MS = SEVEN_DAYS_MS;

/**
 * Период хранения метрик в БД (30 дней)
 */
export const METRICS_DB_RETENTION_DAYS = 30;
