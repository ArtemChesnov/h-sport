
"use client";

import { useQuery } from "@tanstack/react-query";
import { DTO } from "@/shared/services";
import { fetchAdminDashboardStats } from "@/shared/services";

/**
 * Базовый ключ для дашборда.
 */
export const ADMIN_DASHBOARD_QUERY_KEY = ["(admin)", "dashboard"] as const;

type UseAdminDashboardOptions = {
  /**
   * Период для выборки.
   * По умолчанию — "30d".
   */
  period?: DTO.AdminDashboardPeriodDto;
};

/**
 * Хук для получения статистики дашборда админки.
 *
 * Пример:
 * const { data, isLoading } = useAdminDashboardQuery({ period: "7d" });
 */
export function useAdminDashboardQuery(options: UseAdminDashboardOptions = {}) {
  const { period = "30d" } = options;

  return useQuery({
    queryKey: [...ADMIN_DASHBOARD_QUERY_KEY, period],
    queryFn: () => fetchAdminDashboardStats(period),
    staleTime: 60_000, // минуту считаем данные свежими
  });
}
