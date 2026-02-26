/**
 * Хук для загрузки и обработки бизнес-метрик
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchBusinessMetrics } from "@/shared/services";
import { getTopHour, formatHour } from "@/shared/lib/business-metrics";
import { METRICS_CONSTANTS } from "@/shared/constants";
import type { BaseMetricsCardProps } from "@/shared/services/dto";

export function useBusinessMetrics({ period }: BaseMetricsCardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["business-metrics", period],
    queryFn: () => fetchBusinessMetrics(period),
    staleTime: METRICS_CONSTANTS.STALE_TIME,
    refetchInterval: METRICS_CONSTANTS.REFETCH_INTERVAL,
    placeholderData: (previousData) => previousData,
  });

  // Мемоизация вычислений
  const topHour = useMemo(() => getTopHour(data?.abandonedCarts?.byHour ?? []), [data]);
  const topHourFormatted = useMemo(() => formatHour(topHour), [topHour]);
  const withPromoCodePercent = useMemo(() => {
    const abandonedCarts = data?.abandonedCarts;
    if (!abandonedCarts?.total || abandonedCarts.total === 0) return 0;
    return Math.round(((abandonedCarts.withPromoCode ?? 0) / abandonedCarts.total) * 100);
  }, [data]);

  const vipCustomersCount = useMemo(() => {
    return data?.ltv?.topCustomers?.filter((c) => c.orderCount >= 3).length ?? 0;
  }, [data]);

  return {
    data,
    isLoading,
    error,
    topHourFormatted,
    withPromoCodePercent,
    vipCustomersCount,
  };
}
