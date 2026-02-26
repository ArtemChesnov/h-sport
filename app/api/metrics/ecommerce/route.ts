/**
 * GET /api/metrics/ecommerce
 * Получить агрегированные e-commerce метрики
 * Только для администраторов
 */

import { NextRequest, NextResponse } from "next/server";
import { getAggregatedEcommerceMetrics } from "@/shared/lib/ecommerce-metrics";
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

  const searchParams = request.nextUrl.searchParams;

  // Поддержка старого формата с параметром window (для EcommerceMetricsCard)
  const windowHours = searchParams.get("window");
  if (windowHours) {
    const { getEcommerceMetrics } = await import("@/shared/lib/ecommerce-metrics");
    const timeWindowMs = parseInt(windowHours, 10) * 60 * 60 * 1000;
    const metrics = await getEcommerceMetrics(timeWindowMs);
    return NextResponse.json(metrics, { status: 200 });
  }

  // Новый формат с period и interval (для агрегированных метрик)
  const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d
  const interval = (searchParams.get("interval") || "day") as "hour" | "day";

  // Преобразуем период в миллисекунды
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const timeWindowMs = days * 24 * 60 * 60 * 1000;

  const metrics = await getAggregatedEcommerceMetrics(timeWindowMs, interval);

  return NextResponse.json(metrics, { status: 200 });
});
