/**
 * Компонент графика для e-commerce метрик
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type EcommerceChartProps = {
  data: Array<{
    period: string;
    timestamp: number;
    Просмотры: number;
    "В корзину": number;
    "Просмотр → Корзина": number;
    "Корзина → Заказ": number;
  }>;
  interval: "hour" | "day";
};

export function EcommerceChart({ data, interval }: EcommerceChartProps) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Динамика метрик</CardTitle>
        <CardDescription className="text-xs">
          Изменение показателей по {interval === "hour" ? "часам" : "дням"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={520}>
          <ComposedChart data={data} margin={{ top: 15, right: 15, left: 5, bottom: 20 }}>
            <defs>
              <linearGradient id="gradient-views" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradient-cart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradient-view-to-cart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gradient-cart-to-order" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="period"
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
              tickFormatter={(value) => value.toLocaleString()}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "10px 14px",
                boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.15)",
                fontSize: "12px",
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: "6px",
                color: "#111827",
              }}
              itemStyle={{
                padding: "2px 0",
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const validMetrics = ["Просмотры", "В корзину", "Просмотр → Корзина", "Корзина → Заказ"];
                const linePayload = payload.filter((item) => {
                  return item.dataKey && validMetrics.includes(item.dataKey as string);
                });
                if (!linePayload.length) return null;

                return (
                  <div style={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    boxShadow: "0 8px 16px -4px rgba(0, 0, 0, 0.15)",
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: "6px", color: "#111827" }}>{label}</p>
                    {linePayload.map((entry, index) => {
                      const numValue = Number(entry.value) || 0;
                      return (
                        <p key={index} style={{ padding: "2px 0", color: entry.color }}>
                          {`${entry.dataKey}: ${numValue.toLocaleString()}`}
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
                  "Просмотры": "#3b82f6",
                  "В корзину": "#a855f7",
                  "Просмотр → Корзина": "#10b981",
                  "Корзина → Заказ": "#f59e0b",
                };
                const validMetrics = ["Просмотры", "В корзину", "Просмотр → Корзина", "Корзина → Заказ"];
                const seen = new Set<string>();
                const linePayload = payload.filter((item) => {
                  if (!item.dataKey || !validMetrics.includes(item.dataKey as string)) return false;
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
                    padding: "10px 0",
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
            {/* Area под линиями для премиум эффекта - скрыты из Legend и Tooltip */}
            <Area
              type="monotone"
              dataKey="Просмотры"
              fill="url(#gradient-views)"
              stroke="none"
              opacity={0.7}
              hide={true}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="В корзину"
              fill="url(#gradient-cart)"
              stroke="none"
              opacity={0.7}
              hide={true}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="Просмотр → Корзина"
              fill="url(#gradient-view-to-cart)"
              stroke="none"
              opacity={0.7}
              hide={true}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="Корзина → Заказ"
              fill="url(#gradient-cart-to-order)"
              stroke="none"
              opacity={0.7}
              hide={true}
              isAnimationActive={false}
            />
            {/* Линии метрик */}
            <Line
              type="monotone"
              dataKey="Просмотры"
              stroke="#3b82f6"
              strokeWidth={3.5}
              dot={{ r: 5, fill: "#3b82f6", strokeWidth: 0, opacity: 0.95 }}
              activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 3, fill: "white", strokeOpacity: 0.9 }}
            />
            <Line
              type="monotone"
              dataKey="В корзину"
              stroke="#a855f7"
              strokeWidth={3.5}
              dot={{ r: 5, fill: "#a855f7", strokeWidth: 0, opacity: 0.95 }}
              activeDot={{ r: 8, stroke: "#a855f7", strokeWidth: 3, fill: "white", strokeOpacity: 0.9 }}
            />
            <Line
              type="monotone"
              dataKey="Просмотр → Корзина"
              stroke="#10b981"
              strokeWidth={3.5}
              dot={{ r: 5, fill: "#10b981", strokeWidth: 0, opacity: 0.95 }}
              activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 3, fill: "white", strokeOpacity: 0.9 }}
            />
            <Line
              type="monotone"
              dataKey="Корзина → Заказ"
              stroke="#f59e0b"
              strokeWidth={3.5}
              dot={{ r: 5, fill: "#f59e0b", strokeWidth: 0, opacity: 0.95 }}
              activeDot={{ r: 8, stroke: "#f59e0b", strokeWidth: 3, fill: "white", strokeOpacity: 0.9 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
