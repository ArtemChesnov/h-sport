/**
 * GET /api/metrics/advanced
 * Расширенные метрики для интернет-магазина
 */

import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { getAdvancedMetricsData } from "@/shared/services/server/metrics/metrics-route.service";
import { NextRequest, NextResponse } from "next/server";

export const GET = withMetricsAuto(async (request: NextRequest): Promise<NextResponse<unknown>> => {
  return withErrorHandling(
    async (req) => {
      const authError = await requireAdmin(req);
      if (authError) return authError;
      try {
        const periodDays = parseInt(new URL(req.url).searchParams.get("days") || "30", 10);
        const metrics = await getAdvancedMetricsData(periodDays);
        return NextResponse.json(metrics);
      } catch (error) {
        if (error && typeof error === "object" && "code" in error) {
          const prismaError = error as { code?: string };
          if (prismaError.code === "P1001") {
            return createErrorResponse("Не удалось подключиться к серверу базы данных.", 503);
          }
        }
        throw error;
      }
    },
    request,
    "GET /api/metrics/advanced",
  );
});
