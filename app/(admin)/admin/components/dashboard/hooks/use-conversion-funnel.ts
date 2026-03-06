"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { BaseMetricsCardProps } from "@/shared/services/dto";
import type { ConversionFunnel } from "@/modules/metrics/lib/business-metrics";

async function fetchConversionFunnel(period: string): Promise<ConversionFunnel> {
  const res = await fetch(`/api/admin/metrics/conversion-funnel?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch conversion funnel");
  return res.json();
}

export function useConversionFunnel({ period }: BaseMetricsCardProps) {
  return useQuery<ConversionFunnel>({
    queryKey: ["admin", "metrics", "conversion-funnel", period],
    queryFn: () => fetchConversionFunnel(period),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
