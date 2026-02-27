/**
 * GET /api/auth/me
 * Получение текущего пользователя
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getSessionUserOrError } from "@/shared/lib/auth/middleware";
import type { SessionUser } from "@/shared/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

async function handler(
  request: NextRequest
): Promise<
  NextResponse<{ success: boolean; message: string } | { success: boolean; user: SessionUser }>
> {
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getSessionUserOrError(request);
  if ("error" in session) return session.error;

  return NextResponse.json({
    success: true,
    user: session.user,
  });
}

export const GET = withMetricsAuto((request: NextRequest) =>
  withErrorHandling(handler, request, "GET /api/auth/me")
);
