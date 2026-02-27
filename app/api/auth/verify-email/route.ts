/**
 * GET /api/auth/verify-email?token=...
 * Подтверждение email пользователя
 */

import { verifyUserEmail } from "@/modules/auth/lib/db";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { logger } from "@/shared/lib/logger";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/verify-email?error=missing_token", request.url));
  }

  const verified = await verifyUserEmail(token);

  if (!verified) {
    return NextResponse.redirect(new URL("/auth/verify-email?error=invalid_token", request.url));
  }

  return NextResponse.redirect(new URL("/auth/verify-email?success=true", request.url));
}

export async function GET(request: NextRequest) {
  try {
    return await withErrorHandling(handler, request, "GET /api/auth/verify-email");
  } catch (error) {
    logger.error("GET /api/auth/verify-email: Ошибка при подтверждении email", error);
    return NextResponse.redirect(new URL("/auth/verify-email?error=server_error", request.url));
  }
}
