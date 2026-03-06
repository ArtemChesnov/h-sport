"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAdminDashboardQuery } from "@/shared/hooks";
import { DTO } from "@/shared/services";
import dynamic from "next/dynamic";
import React from "react";
import { PeriodSwitcher } from "./components/dashboard/period-switcher";
import { SummaryCards } from "./components/dashboard/summary-cards";
import { QuickActionsCard } from "./components/dashboard/quick-actions-card";

// Скелетон для графиков (используется в loading состоянии)
function ChartSkeleton() {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="text-right">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-6">
        <Skeleton className="h-[240px] sm:h-[280px] md:h-[320px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

// Скелетон для метрик-карточек (используется в loading состоянии динамических импортов)
function MetricsSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((id) => (
          <Card key={`dashboard-skeleton-${id}`} className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-9 w-24" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Динамические импорты для тяжелых компонентов с графиками (Recharts) - ускоряет первоначальную компиляцию
const RevenueChart = dynamic(
  () =>
    import("./components/dashboard/revenue-chart").then((mod) => ({ default: mod.RevenueChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const OrdersChart = dynamic(
  () => import("./components/dashboard/orders-chart").then((mod) => ({ default: mod.OrdersChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

const EcommerceMetricsCard = dynamic(
  () =>
    import("./components/dashboard/ecommerce-metrics-card").then((mod) => ({
      default: mod.EcommerceMetricsCard,
    })),
  { ssr: false, loading: () => <MetricsSectionSkeleton /> }
);

const AdvancedMetricsCard = dynamic(
  () =>
    import("./components/dashboard/advanced-metrics-card").then((mod) => ({
      default: mod.AdvancedMetricsCard,
    })),
  { ssr: false, loading: () => <MetricsSectionSkeleton /> }
);

const BusinessMetricsCard = dynamic(
  () =>
    import("./components/dashboard/business-metrics-card").then((mod) => ({
      default: mod.BusinessMetricsCard,
    })),
  { ssr: false, loading: () => <MetricsSectionSkeleton /> }
);

const RetentionMetricsCard = dynamic(
  () =>
    import("./components/dashboard/retention-metrics-card").then((mod) => ({
      default: mod.RetentionMetricsCard,
    })),
  { ssr: false, loading: () => <MetricsSectionSkeleton /> }
);

const ConversionFunnelCard = dynamic(
  () =>
    import("./components/dashboard/conversion-funnel-card").then((mod) => ({
      default: mod.ConversionFunnelCard,
    })),
  { ssr: false, loading: () => <MetricsSectionSkeleton /> }
);

/**
 * Главная страница админки (dashboard) с карточками + графиками.
 * Премиум дизайн в едином стиле.
 */
export function DashboardPageClient() {
  const [period, setPeriod] = React.useState<DTO.AdminDashboardPeriodDto>("30d");

  const { data, isLoading, isError, error } = useAdminDashboardQuery({
    period,
  });

  return (
    <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-6 p-2 pt-12 sm:pt-14 md:pt-4 md:p-4 md:pt-6 lg:p-8">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Главная</h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">
            Панель управления и статистика
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <PeriodSwitcher period={period} onChange={setPeriod} />
        </div>
      </header>

      <Separator />

      {isError ? (
        <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base">Ошибка загрузки</CardTitle>
            <CardDescription className="text-xs">
              {(error as Error)?.message || "Попробуйте обновить страницу"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <QuickActionsCard />

          {/* Блок KPI */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">KPI</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Основные показатели за период</p>
            </div>
            <SummaryCards summary={data?.summary} isLoading={isLoading} />
          </div>

          <Separator />

          {/* Блок Динамика */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Динамика</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Графики выручки и заказов по дням
              </p>
            </div>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              <RevenueChart data={data?.chart} isLoading={isLoading} />
              <OrdersChart data={data?.chart} isLoading={isLoading} />
            </div>
          </div>

          <Separator />

          {/* Блок Поведение пользователей */}
          <EcommerceMetricsCard period={period} />

          <Separator />

          {/* Блок Аналитика продаж */}
          <AdvancedMetricsCard period={period} />

          <Separator />

          {/* Блок Бизнес-аналитика */}
          <BusinessMetricsCard period={period} />

          <Separator />

          {/* Блок Retention (удержание) */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Retention и воронка</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Удержание клиентов и воронка конверсий
              </p>
            </div>
            <div className="space-y-6">
              <RetentionMetricsCard period={period} />
              <ConversionFunnelCard period={period} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
