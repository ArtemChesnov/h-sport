/**
 * График динамики метрик Web Vitals
 */

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Line,
  Legend,
  ReferenceLine,
} from "recharts";
import { Activity } from "lucide-react";
import { formatTimeSeriesTimestamp, formatMetricValue } from "../utils";
import { CORE_METRICS, WEB_VITALS_THRESHOLDS } from "../types";
import type { PeriodOption } from "../types";

interface TimeSeriesPoint {
  timestamp: number;
  metrics: Array<{
    name: string;
    avgValue: number;
    count: number;
  }>;
}

interface WebVitalsChartProps {
  timeSeries: TimeSeriesPoint[];
  period: PeriodOption;
}

const METRIC_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

export function WebVitalsChart({ timeSeries, period }: WebVitalsChartProps) {
  // Подготовка данных для графика
  const chartData = timeSeries.map((point) => {
    const dataPoint: Record<string, number | string | null> = {
      timestamp: point.timestamp,
    };
    // Инициализируем все метрики как null
    for (const metricName of CORE_METRICS) {
      dataPoint[metricName] = null;
    }
    // Заполняем значениями из данных
    for (const metric of point.metrics) {
      if (CORE_METRICS.includes(metric.name)) {
        dataPoint[metric.name] = metric.avgValue;
      }
    }
    return dataPoint;
  });

  if (chartData.length === 0) return null;

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Динамика метрик</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={520}>
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: 5, bottom: 20 }}>
            <defs>
              {CORE_METRICS.map((metricName, index) => {
                const color = METRIC_COLORS[index % METRIC_COLORS.length];
                return (
                  <linearGradient key={metricName} id={`gradient-${metricName}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                    <stop offset="50%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => formatTimeSeriesTimestamp(value, period)}
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={50}
              interval="preserveStartEnd"
              tickMargin={4}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(value) => {
                const metricName = CORE_METRICS[0];
                return metricName === "CLS" ? value.toFixed(2) : `${value}ms`;
              }}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const linePayload = payload.filter((item) => {
                  return item.dataKey && CORE_METRICS.includes(item.dataKey as string);
                });
                if (!linePayload.length) return null;

                return (
                  <div style={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.15)",
                    fontSize: "12px",
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: "6px", color: "#111827" }}>
                      {typeof label === "number" ? formatTimeSeriesTimestamp(label, period) : String(label || "")}
                    </p>
                    {linePayload.map((entry, index) => {
                      const metricName = entry.dataKey as string;
                      const threshold = WEB_VITALS_THRESHOLDS[metricName];
                      const numValue = Number(entry.value);
                      if (numValue === null || numValue === undefined || isNaN(numValue)) return null;
                      const isGood = threshold && numValue <= threshold.good;
                      const isNeedsImprovement = threshold && numValue > threshold.good && numValue <= threshold.needsImprovement;
                      const status = isGood ? "✓ Хорошо" : isNeedsImprovement ? "⚠ Нужно улучшить" : "✗ Плохо";
                      const formattedValue = formatMetricValue(metricName, numValue);
                      return (
                        <p key={index} style={{ padding: "2px 0", color: entry.color }}>
                          {`${metricName}: ${formattedValue} (${status})`}
                        </p>
                      );
                    })}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "15px", paddingBottom: "5px" }}
              iconType="line"
              iconSize={12}
              content={({ payload }) => {
                if (!payload) return null;
                const metricColors: Record<string, string> = {
                  CLS: "#6366f1",
                  FCP: "#0ea5e9",
                  INP: "#10b981",
                  LCP: "#f59e0b",
                  TTFB: "#ef4444",
                };
                const seen = new Set<string>();
                const linePayload = payload.filter((item) => {
                  if (!item.dataKey || !CORE_METRICS.includes(item.dataKey as string)) return false;
                  if (seen.has(item.dataKey as string)) return false;
                  seen.add(item.dataKey as string);
                  return true;
                });
                return (
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "24px",
                    justifyContent: "center",
                    padding: "20px 0",
                  }}>
                    {linePayload.map((entry, index) => {
                      const metricName = entry.dataKey as string;
                      const color = metricColors[metricName] || entry.color || "#6b7280";
                      if (!metricName) return null;
                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <svg width="28" height="4" style={{ flexShrink: 0 }}>
                            <line
                              x1="0"
                              y1="2"
                              x2="28"
                              y2="2"
                              stroke={color}
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span style={{
                            fontSize: "14px",
                            fontWeight: "500",
                            color,
                          }}>
                            {metricName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            {CORE_METRICS.map((metricName, index) => {
              const color = METRIC_COLORS[index % METRIC_COLORS.length];
              const threshold = WEB_VITALS_THRESHOLDS[metricName];

              return (
                <React.Fragment key={metricName}>
                  <Area
                    type="monotone"
                    dataKey={metricName}
                    fill={`url(#gradient-${metricName})`}
                    stroke="none"
                    opacity={0.8}
                    hide={true}
                    isAnimationActive={false}
                  />
                  {threshold && (
                    <ReferenceLine
                      y={threshold.good}
                      stroke={color}
                      strokeDasharray="5 5"
                      strokeOpacity={0.4}
                      label={{
                        value: `Хорошо (${metricName === "CLS" ? threshold.good.toFixed(2) : `${threshold.good}ms`})`,
                        position: "right",
                        fill: color,
                        fontSize: 9,
                        offset: 5
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey={metricName}
                    stroke={color}
                    strokeWidth={3.5}
                    dot={{ r: 5, fill: color, strokeWidth: 0, opacity: 0.95 }}
                    activeDot={{ r: 8, stroke: color, strokeWidth: 3, fill: "white", strokeOpacity: 0.9 }}
                    connectNulls={true}
                    name={metricName}
                  />
                </React.Fragment>
              );
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
