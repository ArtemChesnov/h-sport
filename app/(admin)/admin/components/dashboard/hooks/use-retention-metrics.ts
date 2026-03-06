"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { BaseMetricsCardProps } from "@/shared/services/dto";
import type { RetentionMetrics } from "@/modules/metrics/lib/business-metrics";

type RetentionPeriod = "30d" | "90d" | "180d";

const RETENTION_PERIOD_MAP: Record<string, RetentionPeriod> = {
  "30d": "30d",
  "90d": "90d",
  "180d": "180d",
};

function periodToRetentionPeriod(period: string): RetentionPeriod {
  return RETENTION_PERIOD_MAP[period] ?? "90d";
}

async function fetchRetention(period: RetentionPeriod): Promise<RetentionMetrics> {
  const res = await fetch(`/api/admin/metrics/retention?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch retention metrics");
  return res.json();
}

export function useRetentionMetrics({ period }: BaseMetricsCardProps) {
  const retentionPeriod = periodToRetentionPeriod(period);
  return useQuery<RetentionMetrics>({
    queryKey: ["admin", "metrics", "retention", retentionPeriod],
    queryFn: () => fetchRetention(retentionPeriod),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
