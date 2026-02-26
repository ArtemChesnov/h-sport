/**
 * GET /api/admin/metrics/product-performance
 * Получить производительность товаров
 * Только для администраторов
 */

import { getProductPerformance, type ProductPerformance } from "@/modules/metrics/lib/business-metrics";
import { METRICS_CACHE_TTL_MS } from "@/shared/constants";
import { CACHE_CONTROL_BUSINESS_METRICS } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { withAuth } from "@/shared/lib/auth/with-auth";
import { getAsync, set } from "@/shared/lib/cache";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Парсит период в дни
 */
function parsePeriodToDays(raw: string | null): number {
  const periods: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };
  return periods[raw ?? "30d"] ?? 30;
}

/**
 * Парсит лимит товаров
 */
function parseLimit(raw: string | null): number {
  const limit = parseInt(raw ?? "50", 10);
  if (!Number.isFinite(limit) || limit < 1) return 50;
  return Math.min(limit, 100); // Максимум 100 товаров
}

const getProductPerformanceHandler = withAuth<ProductPerformance | ErrorResponse>({ role: "ADMIN" })(
  async ({ request }) => {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");
    const days = parsePeriodToDays(period);
    const limit = parseLimit(searchParams.get("limit"));

    const cacheKey = `product-performance:${days}d:${limit}`;
    const cached = await getAsync<ProductPerformance>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "X-Cache": "HIT", "Cache-Control": CACHE_CONTROL_BUSINESS_METRICS },
      });
    }

    const performance = await getProductPerformance(days, limit);
    set(cacheKey, performance, METRICS_CACHE_TTL_MS);
    return NextResponse.json(performance, {
      headers: { "X-Cache": "MISS", "Cache-Control": CACHE_CONTROL_BUSINESS_METRICS },
    });
  },
);

export async function GET(request: NextRequest) {
  return withErrorHandling(getProductPerformanceHandler, request, "GET /api/admin/metrics/product-performance");
}
