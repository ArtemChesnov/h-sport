/**
 * График выручки по дням
 * Премиум дизайн в едином стиле
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/components/ui";
import { DTO } from "@/shared/services";
import { formatMoney } from "@/shared/lib/formatters";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign } from "lucide-react";

function formatDateLabel(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Moscow",
  });
}

interface RevenueChartProps {
  data: DTO.AdminDashboardChartPointDto[] | undefined;
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
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

  const chartData = data ?? [];

  if (chartData.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-base font-semibold">Выручка</CardTitle>
          </div>
          <CardDescription className="text-xs">Динамика по дням</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Нет данных за выбранный период</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = chartData.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base font-semibold">Выручка</CardTitle>
            </div>
            <CardDescription className="text-xs">Динамика по дням</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-900">{formatMoney(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">Всего</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-6">
        <ResponsiveContainer width="100%" height={240} className="sm:h-[280px] md:h-[320px]">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatMoney(value)}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: unknown) => [formatMoney(value as number), "Выручка"]}
              labelFormatter={(label) => formatDateLabel(label)}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
