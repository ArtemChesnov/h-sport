"use client";

/**
 * Дашборд метрик производительности
 * Рефакторинг: разбит на отдельные компоненты для лучшей читаемости
 */

import {
  Card,
  CardContent,
} from "@/shared/components/ui/card";
import {
  TooltipProvider,
} from "@/shared/components/ui/tooltip";
import React from "react";
import dynamic from "next/dynamic";
import { PeriodSwitcherMinutes } from "../../components/dashboard/period-switcher-minutes";

// Типы
import type { PeriodOption } from "./types";

// Хуки
import { useMetricsData } from "./hooks/use-metrics-data";

// Компоненты
import { MetricsLoadingSkeleton } from "./components/metrics-loading-skeleton";
import { MetricsSummaryCards } from "./components/metrics-summary-cards";
import { HttpMethodsCard } from "./components/http-methods-card";
import { SlowestEndpointsCard } from "./components/slowest-endpoints-card";
import { TopEndpointsCard } from "./components/top-endpoints-card";
import { StatusCodesCard } from "./components/status-codes-card";

// Lazy loading для тяжёлых графиков (Recharts)
const MetricsCharts = dynamic(
  () => import("./components/metrics-charts").then((mod) => ({ default: mod.MetricsCharts })),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardContent className="pt-6">
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    ),
  },
);

export function MetricsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodOption>(60);
  const retentionDays: number = 30;

  const { data: metrics, isLoading, error } = useMetricsData(selectedPeriod);

  if (isLoading) {
    return <MetricsLoadingSkeleton />;
  }

  if (error || !metrics) {
    return (
      <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-destructive">Ошибка загрузки метрик</p>
        </CardContent>
      </Card>
    );
  }

  const timeSeries = metrics.timeSeries || [];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Заголовок и переключатель периода */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Метрики API</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Хранение: {retentionDays} {retentionDays === 1 ? "день" : retentionDays < 5 ? "дня" : "дней"}
            </p>
          </div>
          <PeriodSwitcherMinutes period={selectedPeriod} onChange={setSelectedPeriod} />
        </div>

        {/* Основные метрики */}
        <MetricsSummaryCards metrics={metrics} />

        {/* Графики */}
        <MetricsCharts timeSeries={timeSeries} period={selectedPeriod} />

        {/* Метрики по методам и медленные запросы */}
        <div className="grid gap-6 md:grid-cols-2">
          {metrics.requestsPerMethod && Object.keys(metrics.requestsPerMethod).length > 0 && (
            <HttpMethodsCard
              requestsPerMethod={metrics.requestsPerMethod}
              totalRequests={metrics.totalRequests}
            />
          )}
          {metrics.slowestEndpoints && metrics.slowestEndpoints.length > 0 && (
            <SlowestEndpointsCard slowestEndpoints={metrics.slowestEndpoints} />
          )}
        </div>

        {/* Детальная статистика */}
        <div className="grid gap-6 md:grid-cols-2">
          <TopEndpointsCard requestsPerEndpoint={metrics.requestsPerEndpoint} />
          <StatusCodesCard statusCodes={metrics.statusCodes} />
        </div>
      </div>
    </TooltipProvider>
  );
}
