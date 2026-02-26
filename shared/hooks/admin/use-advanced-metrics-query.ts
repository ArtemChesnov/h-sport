"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Хук для получения расширенных бизнес метрик
 */
export function useAdvancedMetricsQuery(days: number = 30) {
  return useQuery({
    queryKey: ["admin", "metrics", "advanced", days],
    queryFn: async () => {
      const response = await fetch(`/api/metrics/advanced?days=${days}`);
      if (!response.ok) throw new Error("Failed to fetch advanced metrics");
      return response.json();
    },
    staleTime: 5 * 60_000, // 5 минут
    refetchInterval: 5 * 60_000, // автообновление каждые 5 минут
  });
}
