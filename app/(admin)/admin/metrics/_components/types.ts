/**
 * Типы для дашборда метрик производительности
 */

export interface MetricsData {
  totalRequests: number;
  averageResponseTime: number;
  requestsPerEndpoint: Record<string, number>;
  errorRate: number;
  statusCodes: Record<number, number>;
  p50: number;
  p95: number;
  p99: number;
  requestsPerMinute: number;
  requestsPerMethod?: Record<string, number>;
  requestsPerSecond?: number;
  slowestEndpoints?: Array<{ endpoint: string; method: string; avgDuration: number; count: number }>;
  timeSeries?: Array<{ timestamp: number; requests: number; avgDuration: number; errors: number }>;
  previousPeriod?: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

export type PeriodOption = 15 | 60 | 360 | 1440 | 10080 | 43200; // минуты: 15м, 1ч, 6ч, 24ч, 7д, 30д

export const PERCENTILE_EXPLANATION = `Перцентили показывают распределение времени ответа:
• P50 (медиана) - половина запросов быстрее этого значения
• P95 - 95% запросов быстрее (показывает типичные "медленные" запросы)
• P99 - 99% запросов быстрее (показывает экстремально медленные запросы)

P95 и P99 важны для понимания реального опыта пользователей, так как среднее значение может скрывать проблемы производительности.`;
