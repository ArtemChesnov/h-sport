import type { AdminDashboardPeriodDto } from "./admin.dashboard.dto";

/**
 * Базовый интерфейс для периода метрик
 */
export interface MetricsPeriod {
  from: string;
  to: string;
  windowMs: number;
}

/**
 * Период с днями
 */
export interface MetricsPeriodWithDays extends MetricsPeriod {
  days: number;
}

/**
 * Период для административной панели
 */
export interface AdminDashboardPeriod {
  period: AdminDashboardPeriodDto;
  from: string;
  to: string;
  days: number;
}

/**
 * Типы периодов для разных метрик
 */
export type MetricsPeriodMinutes = 15 | 60 | 360 | 1440 | 10080 | 43200;
export type WebVitalsPeriodOption = "1d" | "7d" | "30d" | "90d";

/**
 * Константы периодов (в минутах)
 */
export const METRICS_PERIODS = {
  MINUTES_15: 15,
  MINUTES_60: 60,
  HOURS_6: 360,
  HOURS_24: 1440,
  DAYS_7: 10080,
  DAYS_30: 43200,
} as const;

/**
 * Базовый интерфейс для пропсов карточек метрик
 */
export interface BaseMetricsCardProps {
  period: AdminDashboardPeriodDto;
}
