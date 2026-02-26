/**
 * Метрики: API, сервер, БД, алерты, slow query, batch.
 * Единая точка входа @/shared/lib/metrics
 */

export {
  recordApiMetric,
  getApiMetrics,
  clearOldMetrics,
  clearOldMetricsFromDb,
} from "./metrics";
export {
  collectServerMetrics,
  getHeapUsagePercent,
  getFreeMemPercent,
  shouldWarnHeapUsage,
  shouldAlertFreeMem,
  recordServerMetrics,
  type ServerMetricsData,
} from "./server-metrics";
export { getMetricsSummary, getMetricsTableStats } from "./database-stats";
export {
  getRecentAlerts,
  getActiveAlerts,
  ALERT_THRESHOLDS,
  checkConversionRate,
  checkErrorRate,
  checkResponseTime,
  checkAbandonmentRate,
  type MetricAlert,
} from "./metrics-alerts";
export { logSlowQuery, getSlowQueryThreshold } from "./slow-query-logger";
export {
  addApiMetricToBuffer,
  addWebVitalsMetricToBuffer,
  getBufferSizes,
  __resetBuffersForTesting,
  applyBoundsOnAdd,
  applyBoundsOnReturn,
  MAX_BUFFER_SIZE,
  type PendingApiMetric,
  type PendingWebVitalsMetric,
} from "./metrics-batch";
