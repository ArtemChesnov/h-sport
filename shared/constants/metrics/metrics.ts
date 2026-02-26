/**
 * Константы для метрик и аналитики
 */

export const METRICS_CONSTANTS = {
  // Пороги периодов (в минутах)
  PERIOD_THRESHOLD_6H: 360,
  PERIOD_THRESHOLD_24H: 1440,
  PERIOD_THRESHOLD_7D: 10080,
  PERIOD_THRESHOLD_30D: 43200,

  // Количество элементов в топах
  TOP_ITEMS_COUNT: 5,
  TOP_CUSTOMERS_COUNT: 10,
  TOP_COMBINATIONS_COUNT: 10,
  TOP_SIZES_COLORS_COUNT: 8, // Для размеров и цветов (TOP_ITEMS_COUNT + 3)
  TOP_ENDPOINTS_COUNT: 10,
  TOP_SLOW_ENDPOINTS_COUNT: 5,
  TOP_PAGES_COUNT: 5,
  TOP_PRODUCTS_COUNT: 5,

  // Время кеширования (в миллисекундах)
  STALE_TIME: 5 * 60 * 1000, // 5 минут
  REFETCH_INTERVAL: 5 * 60 * 1000, // 5 минут

  // Пороговые значения
  ERROR_RATE_THRESHOLD: 5, // процент ошибок
  PASS_RATE_GOOD: 80, // процент метрик в хорошем диапазоне
  PASS_RATE_ACCEPTABLE: 60,

  // Web Vitals пороги (в миллисекундах для LCP, INP, TTFB, FCP; без единиц для CLS)
  WEB_VITALS_THRESHOLDS: {
    LCP: { good: 2500, needsImprovement: 4000 },
    INP: { good: 200, needsImprovement: 500 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
  } as const,

  // Часы в сутках
  HOURS_PER_DAY: 24,
} as const;
