/**
 * E-commerce метрики: запись, чтение, агрегация, очистка.
 * Единая точка входа @/shared/lib/ecommerce-metrics
 */

export {
  recordProductView,
  recordCartAction,
  recordFavoriteAction,
  recordConversion,
  getEcommerceMetrics,
  clearOldEcommerceMetrics,
  clearOldEcommerceMetricsFromDb,
  clearOldSystemLogsFromDb,
  getAggregatedEcommerceMetrics,
} from "./ecommerce-metrics";
