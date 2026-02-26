/**
 * Утилиты для Web Vitals дашборда
 */

import { WEB_VITALS_THRESHOLDS } from "./types";
import type { PeriodOption } from "./types";

export function getMetricColor(metricName: string, value: number): string {
  const threshold = WEB_VITALS_THRESHOLDS[metricName];
  if (!threshold) return "text-slate-600";
  if (value <= threshold.good) return "text-emerald-600";
  if (value <= threshold.needsImprovement) return "text-amber-600";
  return "text-red-600";
}

export function getMetricBgColor(metricName: string, value: number): string {
  const threshold = WEB_VITALS_THRESHOLDS[metricName];
  if (!threshold) return "bg-slate-50 border-slate-200";
  if (value <= threshold.good) return "bg-emerald-50 border-emerald-200";
  if (value <= threshold.needsImprovement) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function formatTimeSeriesTimestamp(timestamp: number, period: PeriodOption): string {
  const date = new Date(timestamp);
  // Всегда используем московский часовой пояс
  const moscowOptions = { timeZone: "Europe/Moscow" };
  if (period === "1d" || period === "7d") {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", ...moscowOptions });
  }
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", ...moscowOptions });
}

export function formatMetricValue(metricName: string, value: number): string {
  return metricName === "CLS" ? value.toFixed(3) : `${Math.round(value)}ms`;
}
