/**
 * Графики метрик API (запросы и время ответа по времени)
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, Clock } from "lucide-react";
import type { PeriodOption } from "../types";

interface TimeSeriesPoint {
  timestamp: number;
  requests: number;
  avgDuration: number;
  errors: number;
}

interface MetricsChartsProps {
  timeSeries: TimeSeriesPoint[];
  period: PeriodOption;
}

function formatTimeSeriesTimestamp(timestamp: number, period: number): string {
  const date = new Date(timestamp);
  const moscowOptions = { timeZone: "Europe/Moscow" as const };

  // Для коротких периодов (до 6 часов) - показываем время
  if (period <= 360) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", ...moscowOptions });
  }

  // Для 24 часов - показываем дату и время
  if (period <= 1440) {
    return date.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", ...moscowOptions });
  }

  // Для 7 дней - показываем дату
  if (period <= 10080) {
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", ...moscowOptions });
  }

  // Для 30 дней - показываем дату (более компактно)
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", ...moscowOptions });
}

export function MetricsCharts({ timeSeries, period }: MetricsChartsProps) {
  if (timeSeries.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* График запросов */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Запросы по времени</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatTimeSeriesTimestamp(value, period)}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                width={50}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: unknown) => [`${value ?? 0}`, "Запросов"]}
                labelFormatter={(value) => formatTimeSeriesTimestamp(value, period)}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorRequests)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* График времени ответа */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Время ответа</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
              <defs>
                <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatTimeSeriesTimestamp(value, period)}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}ms`}
                width={60}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: unknown) => [`${value ?? 0}ms`, "Время ответа"]}
                labelFormatter={(value) => formatTimeSeriesTimestamp(value, period)}
              />
              <Area
                type="monotone"
                dataKey="avgDuration"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#colorDuration)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
