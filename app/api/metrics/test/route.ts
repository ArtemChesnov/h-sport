/**
 * GET /api/metrics/test
 * Тестовый endpoint для проверки работы метрик
 * Только для администраторов
 */

import { NextRequest, NextResponse } from "next/server";
import { recordApiMetric } from "@/shared/lib/metrics";
import { requireAdmin } from "@/shared/lib/auth/middleware";

export async function GET(request: NextRequest) {
  // Проверка прав администратора
  const authError = await requireAdmin(request);
  if (authError) {
    return authError;
  }

  // Записываем тестовую метрику
  recordApiMetric("/api/metrics/test", "GET", 10, 200);

  return NextResponse.json({
    success: true,
    message: "Тестовая метрика записана",
    timestamp: Date.now(),
  });
}
