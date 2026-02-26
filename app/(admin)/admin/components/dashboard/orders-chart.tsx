/**
 * График количества заказов по дням
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
import { ShoppingBag } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatDateLabel(dateISO: string): string {
  const date = new Date(dateISO);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Moscow",
  });
}

interface OrdersChartProps {
  data: DTO.AdminDashboardChartPointDto[] | undefined;
  isLoading: boolean;
}

export function OrdersChart({ data, isLoading }: OrdersChartProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-36" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
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
            <ShoppingBag className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-base font-semibold">Заказы</CardTitle>
          </div>
          <CardDescription className="text-xs">Количество по дням</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Нет данных за выбранный период</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOrders = chartData.reduce((sum, point) => {
    const orders = typeof point.ordersCount === 'number' ? point.ordersCount : 0;
    return sum + (isNaN(orders) ? 0 : orders);
  }, 0);

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base font-semibold">Заказы</CardTitle>
            </div>
            <CardDescription className="text-xs">Количество по дням</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-900">{totalOrders}</p>
            <p className="text-xs text-muted-foreground">Всего</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-6">
        <ResponsiveContainer width="100%" height={240} className="sm:h-[280px] md:h-[320px]">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
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
              formatter={(value: unknown) => [`${value ?? 0}`, "Заказов"]}
              labelFormatter={(label) => formatDateLabel(label)}
            />
            <Bar dataKey="ordersCount" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
