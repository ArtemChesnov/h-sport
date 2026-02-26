"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Хук для получения алертов системы
 */
export function useAlertsQuery() {
  return useQuery({
    queryKey: ["admin", "metrics", "alerts"],
    queryFn: async () => {
      const response = await fetch("/api/metrics/alerts");
      if (!response.ok) throw new Error("Failed to fetch alerts");
      return response.json();
    },
    staleTime: 60_000, // 1 минута
    refetchInterval: 60_000, // автообновление каждые минуту
  });
}
