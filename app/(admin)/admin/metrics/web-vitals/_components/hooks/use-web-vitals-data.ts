/**
 * Хук для загрузки данных Web Vitals
 */

import { useQuery } from "@tanstack/react-query";
import type { WebVitalsData, PeriodOption } from "../types";

async function fetchWebVitals(period: PeriodOption): Promise<WebVitalsData> {
  const hours = period === "1d" ? 24 : period === "7d" ? 168 : period === "30d" ? 720 : 2160;
  const response = await fetch(`/api/metrics/web-vitals/get?window=${hours}`);
  if (!response.ok) {
    throw new Error("Failed to fetch Web Vitals metrics");
  }
  return response.json();
}

export function useWebVitalsData(period: PeriodOption) {
  return useQuery({
    queryKey: ["web-vitals", period],
    queryFn: () => fetchWebVitals(period),
    staleTime: 30 * 1000, // 30 секунд
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });
}
