/**
 * POST /api/auth/signup
 * Регистрация нового пользователя
 */

import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { createSession, setSessionCookie } from "@/shared/lib/auth/session";
import { isValidEmail, passwordSchema } from "@/shared/lib/validation";
import { signUp } from "@/shared/services/server/auth/auth.service";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const body = await request.json();
  const { email, password, name, secondName } = body;

  if (!email || !password) {
    return createErrorResponse("Email и пароль обязательны", 400);
  }

  if (!isValidEmail(email)) {
    return createErrorResponse("Некорректный email", 400);
  }

  const passwordValidation = passwordSchema.safeParse(password);
  if (!passwordValidation.success) {
    return createErrorResponse(
      passwordValidation.error.issues[0]?.message || "Некорректный пароль",
      400,
    );
  }

  const result = await signUp({ email, password, name, secondName });

  if ("error" in result) {
    return createErrorResponse(result.error, 409);
  }

  const token = await createSession(result.sessionUser);
  const response = NextResponse.json({
    success: true,
    message: "Регистрация успешна. Проверьте email для подтверждения.",
    user: result.sessionUser,
  });
  setSessionCookie(response, token);
  return response;
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/auth/signup");
}
