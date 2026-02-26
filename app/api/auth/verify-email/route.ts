/**
 * GET /api/auth/verify-email?token=...
 * Подтверждение email пользователя
 */

import { verifyUserEmail } from "@/modules/auth/lib/db";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Rate limiting: 100 запросов в минуту (мягкий лимит для одноразовых ссылок)
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=missing_token", request.url),
      );
    }

    const verified = await verifyUserEmail(token);

    if (!verified) {
      return NextResponse.redirect(
        new URL("/auth/verify-email?error=invalid_token", request.url),
      );
    }

    return NextResponse.redirect(new URL("/auth/verify-email?success=true", request.url));
  } catch (error) {
    const {logger} = await import("@/shared/lib/logger");
    logger.error("GET /api/auth/verify-email: Ошибка при подтверждении email", error);
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=server_error", request.url),
    );
  }
}
