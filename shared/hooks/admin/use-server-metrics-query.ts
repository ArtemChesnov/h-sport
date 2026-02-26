"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Хук для получения метрик сервера
 */
export function useServerMetricsQuery() {
  return useQuery({
    queryKey: ["admin", "metrics", "server"],
    queryFn: async () => {
      const response = await fetch("/api/metrics/server");
      if (!response.ok) throw new Error("Failed to fetch server metrics");
      return response.json();
    },
    staleTime: 30_000, // 30 секунд
    refetchInterval: 30_000, // автообновление каждые 30 секунд
  });
}
