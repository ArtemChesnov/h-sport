/**
 * Хук для получения метрик сервера
 */

import { useQuery } from "@tanstack/react-query";

interface ServerMetricsData {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  cpuUser: number;
  cpuSystem: number;
  cpuCount: number;
  freemem: number;
  totalmem: number;
  uptime: number;
}

interface ServerMetricsHistoryItem {
  id: number;
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  cpuUser: number;
  cpuSystem: number;
  cpuCount: number;
  freemem: number;
  totalmem: number;
  uptime: number;
  createdAt: string; // ISO string
}

interface ServerMetricsHistoryResponse {
  items: ServerMetricsHistoryItem[];
}

async function fetchServerMetrics(): Promise<ServerMetricsData> {
  const response = await fetch("/api/metrics/server");

  if (!response.ok) {
    throw new Error("Failed to fetch server metrics");
  }

  return response.json();
}

async function fetchServerMetricsHistory(periodHours: number = 24): Promise<ServerMetricsHistoryResponse> {
  const response = await fetch(`/api/metrics/server/history?period=${periodHours}`);

  if (!response.ok) {
    throw new Error("Failed to fetch server metrics history");
  }

  return response.json();
}

export function useServerMetrics() {
  return useQuery({
    queryKey: ["server-metrics"],
    queryFn: fetchServerMetrics,
    staleTime: 30 * 1000, // 30 секунд
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });
}

export function useServerMetricsHistory(periodHours: number = 24) {
  return useQuery({
    queryKey: ["server-metrics-history", periodHours],
    queryFn: () => fetchServerMetricsHistory(periodHours),
    staleTime: 30 * 1000, // 30 секунд
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });
}
