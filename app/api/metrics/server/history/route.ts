/**
 * GET /api/metrics/server/history
 * История метрик сервера. Только для администраторов.
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { getServerMetricsHistory } from "@/shared/services/server/metrics/metrics-route.service";
import { NextRequest, NextResponse } from "next/server";

function parsePeriod(raw: string | null): number {
  if (!raw) return 24;
  const hours = parseInt(raw, 10);
  if (!Number.isFinite(hours) || hours < 1 || hours > 168) return 24;
  return hours;
}

async function getHandler(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const periodHours = parsePeriod(searchParams.get("period"));
  const result = await getServerMetricsHistory(periodHours);
  return NextResponse.json(result, { status: 200 });
}

export async function GET(request: NextRequest): Promise<NextResponse<unknown>> {
  return withErrorHandling(getHandler, request, "GET /api/metrics/server/history");
}
