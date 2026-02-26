/**
 * Хук для получения топ товаров
 * Решает проблему множественных запросов в одном компоненте
 */

import { useAdminDashboardQuery } from "@/shared/hooks";
import { DTO } from "@/shared/services";

export function useTopProducts(period: DTO.AdminDashboardPeriodDto) {
  const { data, isLoading, isError, error } = useAdminDashboardQuery({ period });

  return {
    topProducts: data?.topProducts ?? [],
    isLoading,
    isError,
    error,
  };
}
