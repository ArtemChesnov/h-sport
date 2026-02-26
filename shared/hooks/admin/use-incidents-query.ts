"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";

interface Incident {
  id: number;
  fingerprint: string;
  source: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  details?: Record<string, unknown>;
  status: "ACTIVE" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
}

interface IncidentsResponse {
  incidents: Incident[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Хук для получения списка инцидентов
 */
export function useIncidentsQuery(filters: {
  status?: "ACTIVE" | "RESOLVED";
  severity?: "INFO" | "WARNING" | "CRITICAL";
  limit?: number;
  offset?: number;
} = {}) {
  const { status, severity, limit = 50, offset = 0 } = filters;

  return useQuery({
    queryKey: ["admin", "incidents", { status, severity, limit, offset }],
    queryFn: async (): Promise<IncidentsResponse> => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (severity) params.set("severity", severity);
      params.set("limit", limit.toString());
      params.set("offset", offset.toString());

      const response = await fetch(`/api/metrics/incidents?${params}`);
      if (!response.ok) throw new Error("Failed to fetch incidents");
      return response.json();
    },
    staleTime: 60_000, // 1 минута
    refetchInterval: 60_000, // автообновление каждые минуту
  });
}

/**
 * Хук для бесконечной пагинации инцидентов
 */
export function useIncidentsInfiniteQuery(filters: {
  status?: "ACTIVE" | "RESOLVED";
  severity?: "INFO" | "WARNING" | "CRITICAL";
  limit?: number;
} = {}) {
  const { status, severity, limit = 20 } = filters;

  return useInfiniteQuery({
    queryKey: ["admin", "incidents", "infinite", { status, severity, limit }],
    queryFn: async ({ pageParam }): Promise<IncidentsResponse> => {
      const offset = pageParam as number;
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (severity) params.set("severity", severity);
      params.set("limit", limit.toString());
      params.set("offset", offset.toString());

      const response = await fetch(`/api/metrics/incidents?${params}`);
      if (!response.ok) throw new Error("Failed to fetch incidents");
      return response.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: IncidentsResponse) => {
      if (!lastPage.pagination.hasMore) return undefined;
      return lastPage.pagination.offset + lastPage.pagination.limit;
    },
    staleTime: 60_000, // 1 минута
    refetchInterval: 60_000, // автообновление каждые минуту
  });
}

/**
 * Хук для создания/обновления инцидента
 */
export function useCreateIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      fingerprint: string;
      source: string;
      severity: "INFO" | "WARNING" | "CRITICAL";
      title: string;
      message: string;
      details?: Record<string, unknown>;
    }) => {
      const response = await fetch("/api/metrics/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create incident");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "incidents"] });
    },
  });
}

/**
 * Хук для обновления статуса инцидента
 */
export function useUpdateIncidentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "ACTIVE" | "RESOLVED" }) => {
      const response = await fetch(`/api/metrics/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update incident");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "incidents"] });
    },
  });
}
