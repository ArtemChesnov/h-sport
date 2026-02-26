/**
 * GET /api/metrics/stats
 * Получить статистику по размеру таблиц метрик
 * Только для администраторов
 */

import { NextRequest, NextResponse } from "next/server";
import { getMetricsSummary } from "@/shared/lib/metrics";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";

export const GET = withMetricsAuto(async (
  request: NextRequest,
): Promise<NextResponse<unknown>> => {
  // Проверка прав администратора
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  const stats = await getMetricsSummary();

  return NextResponse.json(stats, { status: 200 });
});
