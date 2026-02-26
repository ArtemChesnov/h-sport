/**
 * Фасад для дашборда e-commerce метрик
 *
 * Рефакторинг: код разбит на модули:
 * - hooks/use-ecommerce-metrics.ts - хук для загрузки данных
 * - common/ecommerce-metrics-skeleton.tsx - скелетон загрузки
 * - common/ecommerce-kpi-cards.tsx - карточки KPI
 * - common/ecommerce-chart.tsx - график динамики
 *
 * Этот компонент собирает все части дашборда
 */

"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import React from "react";
import { PeriodSwitcher } from "../../components/dashboard/period-switcher";
import { useEcommerceMetrics } from "./hooks/use-ecommerce-metrics";
import { EcommerceMetricsSkeleton } from "./common/ecommerce-metrics-skeleton";
import { EcommerceKpiCards } from "./common/ecommerce-kpi-cards";
import { EcommerceChart } from "./common/ecommerce-chart";

export function EcommerceMetricsDashboard() {
  const {
    metrics,
    isLoading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    interval,
    setInterval,
    totals,
    chartData,
  } = useEcommerceMetrics();

  if (isLoading) {
    return <EcommerceMetricsSkeleton />;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">E-commerce Метрики</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Агрегированные данные по просмотрам, корзине и конверсиям
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setInterval("day")}
              className={`h-8 px-3 text-xs font-medium transition-all rounded-lg cursor-pointer ${
                interval === "day"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              По дням
            </button>
            <button
              type="button"
              onClick={() => setInterval("hour")}
              className={`h-8 px-3 text-xs font-medium transition-all rounded-lg cursor-pointer ${
                interval === "hour"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              По часам
            </button>
          </div>
          <PeriodSwitcher period={selectedPeriod} onChange={setSelectedPeriod} />
        </div>
      </div>

      <EcommerceKpiCards totals={totals} />

      <EcommerceChart data={chartData} interval={interval} />
    </div>
  );
}
