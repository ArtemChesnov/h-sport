/**
 * Web Vitals: клиентский отчёт и серверное чтение/очистка.
 * Единая точка входа @/shared/lib/web-vitals
 */

export type { WebVitals } from "./web-vitals";
export { reportWebVitals } from "./web-vitals";
export {
  getWebVitalsMetrics,
  clearOldWebVitalsMetricsFromDb,
} from "./web-vitals-metrics";
