/**
 * GET /api/admin/metrics/retention
 * Получить метрики retention (удержания клиентов)
 * Только для администраторов
 */

import { getRetentionMetrics, type RetentionMetrics } from "@/modules/metrics/lib/business-metrics";
import { RETENTION_CACHE_TTL_MS } from "@/shared/constants";
import { CACHE_CONTROL_RETENTION } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { getAsync, set } from "@/shared/lib/cache";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

function parsePeriodToDays(raw: string | null): number {
  const periods: Record<string, number> = {
    "30d": 30,
    "90d": 90,
    "180d": 180,
  };
  return periods[raw ?? "90d"] ?? 90;
}

async function getHandler(request: NextRequest): Promise<NextResponse<RetentionMetrics>> {
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<RetentionMetrics>;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");
  const days = parsePeriodToDays(period);

  const cacheKey = `retention-metrics:${days}d`;
  const cached = await getAsync<RetentionMetrics>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT", "Cache-Control": CACHE_CONTROL_RETENTION },
    });
  }

  const retention = await getRetentionMetrics(days);
  set(cacheKey, retention, RETENTION_CACHE_TTL_MS);
  return NextResponse.json(retention, {
    headers: { "X-Cache": "MISS", "Cache-Control": CACHE_CONTROL_RETENTION },
  });
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<RetentionMetrics | ErrorResponse>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/metrics/retention");
}
