"use client";

import { TooltipProvider } from "@/shared/components/ui";
import {
  MetricCard,
  MetricsSection,
  EmptyState,
  MetricsErrorBoundary,
} from "@/shared/components/admin";
import { useRetentionMetrics } from "./hooks/use-retention-metrics";
import type { BaseMetricsCardProps } from "@/shared/services/dto";
import { Users, Repeat, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

type RetentionMetricsCardProps = BaseMetricsCardProps;

export function RetentionMetricsCard({ period }: RetentionMetricsCardProps) {
  const { data, isLoading, error } = useRetentionMetrics({ period });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-64" />
        </div>
        <MetricsSection title="Retention (удержание)">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[100px] rounded-2xl" />
            ))}
          </div>
        </MetricsSection>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Ошибка загрузки метрик удержания"
        description="Не удалось загрузить данные. Попробуйте обновить страницу."
      />
    );
  }

  return (
    <MetricsErrorBoundary
      title="Ошибка отображения метрик удержания"
      description="Произошла ошибка при отображении данных. Попробуйте обновить страницу."
    >
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Retention (удержание)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Доля клиентов, вернувшихся и сделавших повторные покупки
            </p>
          </div>

          <MetricsSection title="Показатели">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Users}
                title="Всего клиентов"
                value={data.totalCustomers}
                description="За период"
                tooltipTitle="Уникальные клиенты"
                tooltipContent="Общее количество уникальных клиентов, сделавших хотя бы один заказ за период."
                color="slate"
              />
              <MetricCard
                icon={Repeat}
                title="Повторные клиенты"
                value={data.repeatCustomers}
                description={`${data.repeatRate.toFixed(1)}% от всех`}
                tooltipTitle="Repeat rate"
                tooltipContent="Процент клиентов, сделавших более одного заказа за период."
                color="emerald"
              />
              <MetricCard
                icon={Clock}
                title="Среднее время между заказами"
                value={`${data.avgDaysBetweenOrders.toFixed(1)} дн.`}
                description="В днях"
                tooltipTitle="Среднее время между заказами"
                tooltipContent="Среднее количество дней между первым и повторным заказом клиента."
                color="blue"
              />
              <MetricCard
                icon={TrendingUp}
                title="Retention 7d / 30d / 90d"
                value={`${data.retention7d.toFixed(1)}% / ${data.retention30d.toFixed(1)}% / ${data.retention90d.toFixed(1)}%`}
                description="Вернулись и купили снова"
                tooltipTitle="Retention по окнам"
                tooltipContent="Процент клиентов, вернувшихся и сделавших повторную покупку в течение 7, 30 и 90 дней."
                color="indigo"
              />
            </div>
          </MetricsSection>

          {data.cohorts && data.cohorts.length > 0 && (
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Когорты по неделям первой покупки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Неделя</TableHead>
                        <TableHead className="text-right">Новых</TableHead>
                        <TableHead className="text-right">Вернулись 7d</TableHead>
                        <TableHead className="text-right">Rate 7d</TableHead>
                        <TableHead className="text-right">Вернулись 30d</TableHead>
                        <TableHead className="text-right">Rate 30d</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.cohorts.slice(0, 10).map((c) => (
                        <TableRow key={c.cohortWeek}>
                          <TableCell className="text-xs font-medium">
                            {new Date(c.cohortWeek).toLocaleDateString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right text-xs">{c.newCustomers}</TableCell>
                          <TableCell className="text-right text-xs">{c.returned7d}</TableCell>
                          <TableCell className="text-right text-xs">
                            {typeof c.rate7d === "number" ? `${c.rate7d.toFixed(1)}%` : "—"}
                          </TableCell>
                          <TableCell className="text-right text-xs">{c.returned30d}</TableCell>
                          <TableCell className="text-right text-xs">
                            {typeof c.rate30d === "number" ? `${c.rate30d.toFixed(1)}%` : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TooltipProvider>
    </MetricsErrorBoundary>
  );
}
