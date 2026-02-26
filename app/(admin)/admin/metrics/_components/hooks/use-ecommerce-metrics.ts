/**
 * Хук для загрузки e-commerce метрик
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { DTO } from "@/shared/services";

interface AggregatedEcommerceMetrics {
  period: {
    from: string;
    to: string;
    windowMs: number;
  };
  aggregationInterval: "hour" | "day";
  data: Array<{
    period: Date;
    views: number;
    cartAdds: number;
    viewToCart: number;
    cartToOrder: number;
  }>;
}

async function fetchEcommerceMetrics(
  period: DTO.AdminDashboardPeriodDto = "30d",
  interval: "hour" | "day" = "day",
): Promise<AggregatedEcommerceMetrics> {
  const response = await fetch(`/api/metrics/ecommerce?period=${period}&interval=${interval}`);
  if (!response.ok) {
    throw new Error("Failed to fetch e-commerce metrics");
  }
  return response.json();
}

export function useEcommerceMetrics() {
  const [selectedPeriod, setSelectedPeriod] = useState<DTO.AdminDashboardPeriodDto>("30d");
  const [interval, setInterval] = useState<"hour" | "day">("day");

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["ecommerce-metrics", selectedPeriod, interval],
    queryFn: () => fetchEcommerceMetrics(selectedPeriod, interval),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });

  // Вычисляем общие показатели
  const totals = useMemo(() => {
    if (!metrics?.data) {
      return {
        totalViews: 0,
        totalCartAdds: 0,
        totalViewToCart: 0,
        totalCartToOrder: 0,
        viewToCartRate: "0",
        cartToOrderRate: "0",
      };
    }

    const totalViews = metrics.data.reduce((sum, d) => sum + d.views, 0);
    const totalCartAdds = metrics.data.reduce((sum, d) => sum + d.cartAdds, 0);
    const totalViewToCart = metrics.data.reduce((sum, d) => sum + d.viewToCart, 0);
    const totalCartToOrder = metrics.data.reduce((sum, d) => sum + d.cartToOrder, 0);

    const viewToCartRate = totalViews > 0 ? ((totalViewToCart / totalViews) * 100).toFixed(1) : "0";
    const cartToOrderRate = totalCartAdds > 0 ? ((totalCartToOrder / totalCartAdds) * 100).toFixed(1) : "0";

    return {
      totalViews,
      totalCartAdds,
      totalViewToCart,
      totalCartToOrder,
      viewToCartRate,
      cartToOrderRate,
    };
  }, [metrics]);

  // Подготавливаем данные для графика
  const chartData = useMemo(() => {
    if (!metrics?.data) return [];

    function formatTimestamp(date: Date | string, interval: "hour" | "day"): string {
      const d = typeof date === "string" ? new Date(date) : date;
      const moscowOptions = { timeZone: "Europe/Moscow" as const };
      if (interval === "hour") {
        return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", ...moscowOptions });
      }
      return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", ...moscowOptions });
    }

    return metrics.data.map((d) => ({
      period: formatTimestamp(d.period, metrics.aggregationInterval),
      timestamp: typeof d.period === "string" ? new Date(d.period).getTime() : d.period.getTime(),
      Просмотры: d.views,
      "В корзину": d.cartAdds,
      "Просмотр → Корзина": d.viewToCart,
      "Корзина → Заказ": d.cartToOrder,
    }));
  }, [metrics]);

  return {
    metrics,
    isLoading,
    error,
    selectedPeriod,
    setSelectedPeriod,
    interval,
    setInterval,
    totals,
    chartData,
  };
}
