/**
 * Утилиты для конвертации периодов времени
 */

import { DTO } from "@/shared/services";

/**
 * Конвертирует период в дни
 */
export function periodToDays(period: DTO.AdminDashboardPeriodDto): number {
  const map: Record<DTO.AdminDashboardPeriodDto, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  return map[period] ?? 30;
}

/**
 * Конвертирует период в часы
 */
export function periodToHours(period: DTO.AdminDashboardPeriodDto): number {
  return periodToDays(period) * 24;
}
