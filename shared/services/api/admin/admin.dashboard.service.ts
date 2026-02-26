
import type * as DTO from "../../dto";
import { ApiRoutes, axiosInstance } from "../../http";
import { getApiErrorMessage } from "../api-errors";

/**
 * Получить агрегированную статистику для админского дашборда.
 *
 * GET /api/(admin)/dashboard?period=7d|30d|90d
 */
export async function fetchAdminDashboardStats(
  period: DTO.AdminDashboardPeriodDto = "30d",
): Promise<DTO.AdminDashboardResponseDto> {
  try {
    const { data } = await axiosInstance.get<DTO.AdminDashboardResponseDto>(
      ApiRoutes.ADMIN_DASHBOARD,
      {
        params: { period },
      },
    );

    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось получить статистику"),
    );
  }
}
