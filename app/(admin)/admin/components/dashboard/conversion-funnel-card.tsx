"use client";

import { TooltipProvider } from "@/shared/components/ui";
import {
  MetricCard,
  MetricsSection,
  EmptyState,
  MetricsErrorBoundary,
} from "@/shared/components/admin";
import { useConversionFunnel } from "./hooks/use-conversion-funnel";
import type { BaseMetricsCardProps } from "@/shared/services/dto";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Filter, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

type ConversionFunnelCardProps = BaseMetricsCardProps;

export function ConversionFunnelCard({ period }: ConversionFunnelCardProps) {
  const { data, isLoading, error } = useConversionFunnel({ period });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-5 w-56 mb-1" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[90px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Ошибка загрузки воронки конверсий"
        description="Не удалось загрузить данные. Попробуйте обновить страницу."
      />
    );
  }

  const details = data.details ?? {};
  const steps = data.steps ?? [];

  return (
    <MetricsErrorBoundary
      title="Ошибка отображения воронки"
      description="Произошла ошибка при отображении данных. Попробуйте обновить страницу."
    >
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Воронка конверсий</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Путь: посетители → просмотры → корзина → оформление → заказ → оплата
            </p>
          </div>

          <MetricsSection title="Общая конверсия">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                icon={TrendingUp}
                title="Просмотр → Заказ"
                value={`${Number(data.overallConversionRate).toFixed(2)}%`}
                description="Общая конверсия"
                tooltipTitle="Overall conversion"
                tooltipContent="Процент пользователей, дошедших от просмотра товара до оформления заказа."
                color="emerald"
              />
              <MetricCard
                icon={Filter}
                title="Уникальные посетители"
                value={Number(details.uniqueVisitors ?? 0).toLocaleString()}
                description="Просмотрели товары"
                tooltipTitle="Unique visitors"
                tooltipContent="Количество уникальных пользователей, просмотревших товары."
                color="slate"
              />
              <MetricCard
                icon={Filter}
                title="Оплаченные заказы"
                value={Number(details.paidOrders ?? 0).toLocaleString()}
                description="Уникальных пользователей"
                tooltipTitle="Paid orders"
                tooltipContent="Количество уникальных пользователей с оплаченными заказами."
                color="indigo"
              />
            </div>
          </MetricsSection>

          {steps.length > 0 && (
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Шаги воронки</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Шаг</TableHead>
                      <TableHead className="text-right">Кол-во</TableHead>
                      <TableHead className="text-right">Конверсия</TableHead>
                      <TableHead className="text-right">Отток</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {steps.map((step, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-medium">{step.name}</TableCell>
                        <TableCell className="text-right text-xs">
                          {step.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {Number(step.rate).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {Number(step.dropoff).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {details && Object.keys(details).length > 0 && (
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Детали по шагам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                  <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">Просмотры товаров</span>
                    <span className="font-medium">
                      {Number(details.viewedProducts ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">Добавили в корзину</span>
                    <span className="font-medium">
                      {Number(details.addedToCart ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">Начали оформление</span>
                    <span className="font-medium">
                      {Number(details.startedCheckout ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">Оформили заказ</span>
                    <span className="font-medium">
                      {Number(details.completedOrder ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-muted-foreground">Оплаченные заказы</span>
                    <span className="font-medium">
                      {Number(details.paidOrders ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TooltipProvider>
    </MetricsErrorBoundary>
  );
}
