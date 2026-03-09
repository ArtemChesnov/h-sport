/**
 * GET /api/auth/verify-email?token=...
 * Подтверждение email пользователя
 */

import { verifyUserEmail } from "@/modules/auth/lib/db";
import { getAppUrl } from "@/shared/lib/config/env";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { logger } from "@/shared/lib/logger";
import { NextRequest, NextResponse } from "next/server";

function redirectToVerifyPage(query: string): NextResponse {
  const baseUrl = getAppUrl();
  return NextResponse.redirect(`${baseUrl}/auth/verify-email?${query}`);
}

async function handler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return redirectToVerifyPage("error=missing_token");
  }

  const verified = await verifyUserEmail(token);

  if (!verified) {
    return redirectToVerifyPage("error=invalid_token");
  }

  return redirectToVerifyPage("success=true");
}

export async function GET(request: NextRequest) {
  try {
    return await withErrorHandling(handler, request, "GET /api/auth/verify-email");
  } catch (error) {
    logger.error("GET /api/auth/verify-email: Ошибка при подтверждении email", error);
    return redirectToVerifyPage("error=server_error");
  }
}
