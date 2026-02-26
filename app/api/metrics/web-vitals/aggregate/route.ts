/**
 * GET /api/metrics/web-vitals/aggregate
 * Агрегированные метрики Web Vitals за период. Только для администраторов.
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { getWebVitalsAggregate } from "@/shared/services/server/metrics/metrics-route.service";
import { NextRequest, NextResponse } from "next/server";

export const GET = withMetricsAuto(async (request: NextRequest): Promise<NextResponse<unknown>> => {
  return withErrorHandling(
    async (req) => {
      const authError = await requireAdmin(req);
      if (authError) return authError;
      const { searchParams } = new URL(req.url);
      const periodHours = parseInt(searchParams.get("hours") || "24", 10);
      const result = await getWebVitalsAggregate(periodHours);
      return NextResponse.json(result, { status: 200 });
    },
    request,
    "GET /api/metrics/web-vitals/aggregate",
  );
});
