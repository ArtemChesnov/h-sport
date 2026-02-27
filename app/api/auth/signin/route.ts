/**
 * POST /api/auth/signin
 * Вход пользователя
 */

import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { validateRequestBody } from "@/shared/lib/api/validate-request-body";
import { createSession, setSessionCookie } from "@/shared/lib/auth/session";
import { getSessionUserAfterSignIn } from "@/shared/services/server/auth/auth.service";
import { signInSchema } from "@/shared/lib/validation/zod-schemas";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const bodyResult = await validateRequestBody(request, signInSchema);
  if ("error" in bodyResult) return bodyResult.error;
  const { email, password } = bodyResult.data;

  const sessionUser = await getSessionUserAfterSignIn(email, password);

  if (!sessionUser) {
    return createErrorResponse("Неверный email или пароль", 401);
  }

  const token = await createSession(sessionUser);
  const response = NextResponse.json({
    success: true,
    user: sessionUser,
  });
  setSessionCookie(response, token);
  return response;
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/auth/signin");
}
