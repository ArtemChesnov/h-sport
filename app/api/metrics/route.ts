/**
 * GET /api/metrics
 * Получить метрики производительности API
 * Только для администраторов
 */

import { NextRequest, NextResponse } from "next/server";
import { getApiMetrics } from "@/shared/lib/metrics";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";

export const GET = withMetricsAuto(async (request: NextRequest): Promise<NextResponse<unknown>> => {
  // Проверка прав администратора
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  const timeWindow = request.nextUrl.searchParams.get("window");
  const timeWindowMs = timeWindow ? parseInt(timeWindow, 10) * 60 * 1000 : 60 * 60 * 1000; // По умолчанию 1 час

  const metrics = await getApiMetrics(timeWindowMs);

  return NextResponse.json(metrics, { status: 200 });
});
