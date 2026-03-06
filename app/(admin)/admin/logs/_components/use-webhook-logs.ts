"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

export type WebhookResultType = "SUCCESS" | "REPLAY" | "ERROR";

interface WebhookLogItem {
  id: number;
  source: string;
  ip: string | null;
  invId: string | null;
  result: WebhookResultType;
  message: string | null;
  createdAt: string;
}

interface WebhookLogsResponse {
  items: WebhookLogItem[];
  pagination: { page: number; perPage: number; total: number };
}

async function fetchWebhookLogs(
  page: number,
  perPage: number,
  source?: string
): Promise<WebhookLogsResponse> {
  const params = new URLSearchParams({ page: String(page), perPage: String(perPage) });
  if (source) params.set("source", source);
  const res = await fetch(`/api/admin/logs/webhooks?${params}`);
  if (!res.ok) throw new Error("Failed to fetch webhook logs");
  return res.json();
}

export function useWebhookLogs(page: number, perPage: number, source?: string) {
  return useQuery({
    queryKey: ["admin", "logs", "webhooks", page, perPage, source],
    queryFn: () => fetchWebhookLogs(page, perPage, source),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}
