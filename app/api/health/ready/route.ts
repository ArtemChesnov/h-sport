/**
 * GET /api/health/ready
 *
 * Readiness probe: 200 только когда БД (и в production Redis) доступны.
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { runReadinessCheck } from "@/shared/services/server/health/health.service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function handler(_request: NextRequest) {
  const result = await runReadinessCheck();
  if (result.ready) {
    return NextResponse.json({ ready: true });
  }
  return NextResponse.json({ ready: false, reason: result.reason }, { status: 503 });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handler, request, "GET /api/health/ready");
}
