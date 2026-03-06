"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

interface ClientErrorLogItem {
  id: number;
  message: string;
  stack: string | null;
  componentStack: string | null;
  userAgent: string | null;
  url: string | null;
  createdAt: string;
}

interface ClientErrorLogsResponse {
  items: ClientErrorLogItem[];
  pagination: { page: number; perPage: number; total: number };
}

async function fetchClientErrorLogs(
  page: number,
  perPage: number
): Promise<ClientErrorLogsResponse> {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  const res = await fetch(`/api/admin/logs/client-errors?${params}`);
  if (!res.ok) throw new Error("Failed to fetch client error logs");
  return res.json();
}

export function useClientErrorLogs(page: number, perPage: number) {
  return useQuery({
    queryKey: ["admin", "logs", "client-errors", page, perPage],
    queryFn: () => fetchClientErrorLogs(page, perPage),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}
