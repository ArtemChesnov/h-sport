/**
 * GET /api/health/ready
 *
 * Readiness probe: 200 только когда БД (и в production Redis) доступны.
 */

import { NextRequest, NextResponse } from "next/server";
import { runReadinessCheck } from "@/shared/services/server/health/health.service";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const result = await runReadinessCheck();
  if (result.ready) {
    return NextResponse.json({ ready: true });
  }
  return NextResponse.json(
    { ready: false, reason: result.reason },
    { status: 503 },
  );
}
