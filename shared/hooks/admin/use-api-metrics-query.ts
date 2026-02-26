"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Хук для получения метрик API производительности
 */
export function useApiMetricsQuery(timeWindowMs: number = 60 * 60 * 1000) {
  return useQuery({
    queryKey: ["admin", "metrics", "api", timeWindowMs],
    queryFn: async () => {
      const response = await fetch(`/api/metrics?window=${Math.floor(timeWindowMs / (60 * 1000))}`);
      if (!response.ok) throw new Error("Failed to fetch API metrics");
      return response.json();
    },
    staleTime: 30_000, // 30 секунд
    refetchInterval: 30_000, // автообновление каждые 30 секунд
  });
}
