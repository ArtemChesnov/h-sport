/**
 * GET /api/health
 *
 * Health check endpoint для мониторинга
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { runHealthCheck } from "@/shared/services/server/health/health.service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const startTime = Date.now();

async function handler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "health");
  if (rateLimitResponse) return rateLimitResponse;

  const result = await runHealthCheck(startTime);

  if (result.status === "ok") {
    return NextResponse.json(result, { status: 200 });
  }
  return NextResponse.json(result, { status: 503 });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handler, request, "GET /api/health");
}
