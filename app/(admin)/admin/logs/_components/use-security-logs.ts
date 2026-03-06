"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

export type SecurityEventType = "FAILED_LOGIN" | "RATE_LIMIT" | "INVALID_PAYMENT_SIGNATURE";

interface SecurityLogItem {
  id: number;
  type: SecurityEventType;
  ip: string | null;
  userAgent: string | null;
  details: unknown;
  createdAt: string;
}

interface SecurityLogsResponse {
  items: SecurityLogItem[];
  pagination: { page: number; perPage: number; total: number };
}

async function fetchSecurityLogs(
  page: number,
  perPage: number,
  type?: SecurityEventType
): Promise<SecurityLogsResponse> {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  if (type) params.set("type", type);
  const res = await fetch(`/api/admin/logs/security?${params}`);
  if (!res.ok) throw new Error("Failed to fetch security logs");
  return res.json();
}

export function useSecurityLogs(
  page: number,
  perPage: number,
  type?: SecurityEventType
) {
  return useQuery({
    queryKey: ["admin", "logs", "security", page, perPage, type],
    queryFn: () => fetchSecurityLogs(page, perPage, type),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}
