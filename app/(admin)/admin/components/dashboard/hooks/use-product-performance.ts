"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { BaseMetricsCardProps } from "@/shared/services/dto";
import type { ProductPerformance } from "@/modules/metrics/lib/business-metrics";

async function fetchProductPerformance(period: string, limit: number): Promise<ProductPerformance> {
  const res = await fetch(`/api/admin/metrics/product-performance?period=${period}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch product performance");
  return res.json();
}

export function useProductPerformance({ period }: BaseMetricsCardProps, limit: number = 20) {
  return useQuery<ProductPerformance>({
    queryKey: ["admin", "metrics", "product-performance", period, limit],
    queryFn: () => fetchProductPerformance(period, limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}
