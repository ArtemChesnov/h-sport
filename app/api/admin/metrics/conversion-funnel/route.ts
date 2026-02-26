/**
 * GET /api/admin/metrics/conversion-funnel
 * Получить воронку конверсий
 * Только для администраторов
 */

import { getConversionFunnel, type ConversionFunnel } from "@/modules/metrics/lib/business-metrics";
import { METRICS_CACHE_TTL_MS } from "@/shared/constants";
import { CACHE_CONTROL_BUSINESS_METRICS } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { getAsync, set } from "@/shared/lib/cache";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

function parsePeriodToDays(raw: string | null): number {
  const periods: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  return periods[raw ?? "30d"] ?? 30;
}

async function getHandler(request: NextRequest): Promise<NextResponse<ConversionFunnel>> {
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<ConversionFunnel>;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period");
  const days = parsePeriodToDays(period);

  const cacheKey = `conversion-funnel:${days}d`;
  const cached = await getAsync<ConversionFunnel>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT", "Cache-Control": CACHE_CONTROL_BUSINESS_METRICS },
    });
  }

  const funnel = await getConversionFunnel(days);
  set(cacheKey, funnel, METRICS_CACHE_TTL_MS);
  return NextResponse.json(funnel, {
    headers: { "X-Cache": "MISS", "Cache-Control": CACHE_CONTROL_BUSINESS_METRICS },
  });
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ConversionFunnel | ErrorResponse>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/metrics/conversion-funnel");
}
