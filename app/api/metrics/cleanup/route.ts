/**
 * POST /api/metrics/cleanup
 * Ручная очистка старых метрик из БД
 * Только для администраторов
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { clearOldEcommerceMetricsFromDb } from "@/shared/lib/ecommerce-metrics";
import { clearOldMetricsFromDb } from "@/shared/lib/metrics";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  await clearOldMetricsFromDb(7);
  await clearOldEcommerceMetricsFromDb(30);

  return NextResponse.json({
    success: true,
    message: "Старые метрики успешно очищены",
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/metrics/cleanup");
}
