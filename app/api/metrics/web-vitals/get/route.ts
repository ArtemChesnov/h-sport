/**
 * GET /api/metrics/web-vitals/get
 * Получить Web Vitals метрики
 * Только для администраторов
 */

import { NextRequest, NextResponse } from "next/server";
import { getWebVitalsMetrics } from "@/shared/lib/web-vitals";
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

  const timeWindow = request.nextUrl.searchParams.get("window");
  const timeWindowMs = timeWindow
    ? parseInt(timeWindow, 10) * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000; // По умолчанию 24 часа

  const metrics = await getWebVitalsMetrics(timeWindowMs);

  return NextResponse.json(metrics, { status: 200 });
});
