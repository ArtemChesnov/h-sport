/**
 * POST /api/auth/reset-password
 * Запрос на восстановление пароля
 */

import { createPasswordResetToken } from "@/modules/auth/lib/db";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { isValidEmail } from "@/shared/lib/validation";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const body = await request.json();
  const { email } = body;

  if (!email) {
    return createErrorResponse("Email обязателен", 400);
  }

  if (!isValidEmail(email)) {
    return createErrorResponse("Некорректный email", 400);
  }

  await createPasswordResetToken(email);

  return NextResponse.json({
    success: true,
    message:
      "Если пользователь с таким email существует, на него отправлено письмо с инструкциями",
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/auth/reset-password");
}
