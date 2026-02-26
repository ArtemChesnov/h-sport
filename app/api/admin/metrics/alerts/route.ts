/**
 * GET /api/admin/metrics/alerts
 * Получить активные алерты по метрикам
 * Только для администраторов
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { withAuth } from "@/shared/lib/auth/with-auth";
import { getRecentAlerts, type MetricAlert } from "@/shared/lib/metrics";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

interface AlertsResponse {
  alerts: MetricAlert[];
  count: number;
}

const getAlertsHandler = withAuth<AlertsResponse | ErrorResponse>({ role: "ADMIN" })(
  async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.min(parseInt(limitRaw ?? "20", 10), 100);
    const alerts = getRecentAlerts(limit);
    return NextResponse.json({ alerts, count: alerts.length });
  },
);

export async function GET(request: NextRequest) {
  return withErrorHandling(getAlertsHandler, request, "GET /api/admin/metrics/alerts");
}
