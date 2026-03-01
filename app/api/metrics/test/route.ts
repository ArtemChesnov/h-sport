/**
 * GET /api/metrics/test
 * Тестовый endpoint для проверки работы метрик (только для администраторов).
 * В production возвращает 404 — доступен только в development.
 */

import { env } from "@/shared/lib/config/env";
import { NextRequest, NextResponse } from "next/server";
import { recordApiMetric } from "@/shared/lib/metrics";
import { requireAdmin } from "@/shared/lib/auth/middleware";

export async function GET(request: NextRequest) {
  if (env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  recordApiMetric("/api/metrics/test", "GET", 10, 200);

  return NextResponse.json({
    success: true,
    message: "Тестовая метрика записана",
    timestamp: Date.now(),
  });
}
