"use client";

import { useQuery } from "@tanstack/react-query";

interface DBMetrics {
  period: {
    hours: number;
    from: string;
    to: string;
  };
  threshold: {
    slowQueryMs: number;
  };
  slowQueries: {
    total: number;
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
    maxDuration: number;
    totalDuration: number;
  };
  topSlowQueries: Array<{
    query: string;
    duration: number;
    endpoint: string | null;
    createdAt: string;
  }>;
  byEndpoint: Array<{
    endpoint: string;
    count: number;
    avgDuration: number;
  }>;
  connectionPool: {
    provider: string;
    note: string;
  };
}

/**
 * Хук для получения метрик базы данных
 */
export function useDBMetricsQuery(hours: number = 24) {
  return useQuery({
    queryKey: ["admin", "metrics", "db", hours],
    queryFn: async (): Promise<DBMetrics> => {
      const response = await fetch(`/api/metrics/db?hours=${hours}`);
      if (!response.ok) throw new Error("Failed to fetch DB metrics");
      return response.json();
    },
    staleTime: 5 * 60_000, // 5 минут
    refetchInterval: 5 * 60_000, // автообновление каждые 5 минут
  });
}
