"use client";

/**
 * Дашборд Web Vitals метрик
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
import { WebVitalsPeriodSwitcher } from "./web-vitals-period-switcher";

// Типы
import type { PeriodOption } from "./types";
import { CORE_METRICS } from "./types";

// Хуки
import { useWebVitalsData } from "./hooks/use-web-vitals-data";

// Компоненты
import { WebVitalsLoadingSkeleton } from "./components/web-vitals-loading-skeleton";
import { MetricCard } from "./components/metric-card";
import { PassRateCard } from "./components/pass-rate-card";
import { TopPagesCard } from "./components/top-pages-card";
import { DetailedStatsCard } from "./components/detailed-stats-card";

// Lazy loading для тяжёлого графика (Recharts)
const WebVitalsChart = dynamic(
  () => import("./components/web-vitals-chart").then((mod) => ({ default: mod.WebVitalsChart })),
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

export function WebVitalsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodOption>("1d");

  const { data: metrics, isLoading, error } = useWebVitalsData(selectedPeriod);

  if (isLoading) {
    return <WebVitalsLoadingSkeleton />;
  }

  if (error || !metrics) {
    return (
      <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-destructive">Ошибка загрузки Web Vitals метрик</p>
        </CardContent>
      </Card>
    );
  }

  const statsEntries = Object.entries(metrics.statsByType).filter(([name]) =>
    CORE_METRICS.includes(name),
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Заголовок и переключатель периода */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Метрики Web Vitals</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Производительность страниц и пользовательский опыт
            </p>
          </div>
          <WebVitalsPeriodSwitcher period={selectedPeriod} onChange={setSelectedPeriod} />
        </div>

        {/* Основные метрики */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CORE_METRICS.map((metricName) => (
            <MetricCard
              key={metricName}
              metricName={metricName}
              stats={metrics.statsByType[metricName]}
            />
          ))}
          {/* Pass Rate карточка */}
          <PassRateCard statsByType={metrics.statsByType} />
        </div>

        {/* График временного ряда */}
        <WebVitalsChart timeSeries={metrics.timeSeries} period={selectedPeriod} />

        {/* Топ страниц */}
        <TopPagesCard topPages={metrics.topPages} />

        {/* Детальная статистика */}
        <DetailedStatsCard statsEntries={statsEntries} />
      </div>
    </TooltipProvider>
  );
}
