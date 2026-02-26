/**
 * Хук для получения медленных запросов к БД
 */

import { useQuery } from "@tanstack/react-query";

interface SlowQueryItem {
  id: number;
  query: string;
  duration: number;
  endpoint: string | null;
  userId: string | null;
  createdAt: string; // ISO string
}

interface SlowQueriesResponse {
  items: SlowQueryItem[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    pages: number;
  };
}

interface SlowQueriesParams {
  page?: number;
  perPage?: number;
  period?: number; // дни
  minDuration?: number; // миллисекунды
  endpoint?: string;
}

async function fetchSlowQueries(params: SlowQueriesParams = {}): Promise<SlowQueriesResponse> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }
  if (params.perPage !== undefined) {
    searchParams.set("perPage", String(params.perPage));
  }
  if (params.period !== undefined) {
    searchParams.set("period", String(params.period));
  }
  if (params.minDuration !== undefined) {
    searchParams.set("minDuration", String(params.minDuration));
  }
  if (params.endpoint) {
    searchParams.set("endpoint", params.endpoint);
  }

  const response = await fetch(`/api/admin/metrics/slow-queries?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch slow queries");
  }

  return response.json();
}

export function useSlowQueries(params: SlowQueriesParams = {}) {
  return useQuery({
    queryKey: ["slow-queries", params],
    queryFn: () => fetchSlowQueries(params),
    staleTime: 30 * 1000, // 30 секунд
    refetchInterval: 30 * 1000, // Обновляем каждые 30 секунд
  });
}
