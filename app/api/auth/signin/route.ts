/**
 * POST /api/auth/signin
 * Вход пользователя
 */

import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { createSession, setSessionCookie } from "@/shared/lib/auth/session";
import { getSessionUserAfterSignIn } from "@/shared/services/server/auth/auth.service";
import { isValidEmail } from "@/shared/lib/validation";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return createErrorResponse("Email и пароль обязательны", 400);
  }

  if (!isValidEmail(email)) {
    return createErrorResponse("Некорректный email", 400);
  }

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
