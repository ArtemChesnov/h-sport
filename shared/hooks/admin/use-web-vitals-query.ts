"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Хук для получения агрегированных метрик Web Vitals
 */
export function useWebVitalsQuery(hours: number = 24) {
  return useQuery({
    queryKey: ["admin", "metrics", "web-vitals", hours],
    queryFn: async () => {
      const response = await fetch(`/api/metrics/web-vitals/aggregate?hours=${hours}`);
      if (!response.ok) throw new Error("Failed to fetch Web Vitals metrics");
      return response.json();
    },
    staleTime: 5 * 60_000, // 5 минут
    refetchInterval: 5 * 60_000, // автообновление каждые 5 минут
  });
}
