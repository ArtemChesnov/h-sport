/**
 * Хук для загрузки данных метрик API
 */

import { useQuery } from "@tanstack/react-query";
import type { MetricsData, PeriodOption } from "../types";

async function fetchMetrics(windowMinutes: number = 60): Promise<MetricsData> {
  const response = await fetch(`/api/metrics?window=${windowMinutes}`);
  if (!response.ok) {
    throw new Error("Failed to fetch metrics");
  }
  return response.json();
}

export function useMetricsData(period: PeriodOption) {
  return useQuery({
    queryKey: ["metrics", period],
    queryFn: () => fetchMetrics(period),
    staleTime: 30 * 1000, // Данные считаются свежими 30 секунд
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });
}
