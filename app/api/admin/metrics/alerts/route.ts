/**
 * GET /api/admin/metrics/alerts
 * Получить активные алерты по метрикам
 * Только для администраторов
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { getRecentAlerts, type MetricAlert } from "@/shared/lib/metrics";
import { NextRequest, NextResponse } from "next/server";

interface AlertsResponse {
  alerts: MetricAlert[];
  count: number;
}

async function handler(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const limitRaw = searchParams.get("limit");
  const limit = Math.min(parseInt(limitRaw ?? "20", 10), 100);
  const alerts = getRecentAlerts(limit);
  return NextResponse.json<AlertsResponse>({ alerts, count: alerts.length });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handler, request, "GET /api/admin/metrics/alerts");
}
