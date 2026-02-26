import { CACHE_CONTROL_ADMIN_DASHBOARD } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { DTO } from "@/shared/services";
import { getDashboardData, parsePeriod } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/(admin)/dashboard
 *
 * Получает агрегированную статистику для административного дашборда.
 *
 * @description
 * Возвращает агрегированную статистику за указанный период:
 * - Сводные показатели: общее количество заказов, выручка, средний чек, оплаченные заказы
 * - Данные для графика по дням: количество заказов и выручка по каждому дню периода
 * - Топ-3 товара по продажам: самые продаваемые товары за период
 *
 * Поддерживаемые периоды: "7d", "30d", "90d" (по умолчанию "30d").
 */
async function getHandler(
  req: NextRequest,
): Promise<NextResponse<DTO.AdminDashboardResponseDto>> {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(req);
  if (authError) {
    return authError as NextResponse<DTO.AdminDashboardResponseDto>;
  }

  const { searchParams } = new URL(req.url);
  const period = parsePeriod(searchParams.get("period"));
  const data = await getDashboardData(period);

  return NextResponse.json<DTO.AdminDashboardResponseDto>(data, {
    status: 200,
    headers: {
      "Cache-Control": CACHE_CONTROL_ADMIN_DASHBOARD,
    },
  });
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<DTO.AdminDashboardResponseDto | ErrorResponse>> {
  return withErrorHandling(getHandler, req, "GET /api/admin/dashboard");
}
