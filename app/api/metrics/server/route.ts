/**
 * GET /api/metrics/server
 * Получить метрики сервера Node.js
 * Только для администраторов
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { collectServerMetrics } from "@/shared/lib/metrics";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  const metrics = collectServerMetrics();
  return NextResponse.json(metrics, { status: 200 });
}

export async function GET(request: NextRequest): Promise<NextResponse<unknown>> {
  return withErrorHandling(getHandler, request, "GET /api/metrics/server");
}
