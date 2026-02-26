/**
 * GET /api/health
 *
 * Health check endpoint для мониторинга
 */

import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { runHealthCheck } from "@/shared/services/server/health/health.service";

export const dynamic = "force-dynamic";

const startTime = Date.now();

export async function GET(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "health");
  if (rateLimitResponse) return rateLimitResponse;

  const result = await runHealthCheck(startTime);

  if (result.status === "ok") {
    return NextResponse.json(result, { status: 200 });
  }
  return NextResponse.json(result, { status: 503 });
}
