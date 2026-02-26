import { resetPassword } from "@/modules/auth/lib/db";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { passwordSchema } from "@/shared/lib/validation";
import { NextRequest, NextResponse } from "next/server";

async function postHandler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const body = await request.json();
  const { token, password } = body;

  if (!token || !password) {
    return createErrorResponse("Токен и пароль обязательны", 400);
  }

  const passwordValidation = passwordSchema.safeParse(password);
  if (!passwordValidation.success) {
    return createErrorResponse(
      passwordValidation.error.issues[0]?.message || "Некорректный пароль",
      400,
    );
  }

  const success = await resetPassword(token, password);

  if (!success) {
    return createErrorResponse("Неверный или истёкший токен", 400);
  }

  return NextResponse.json({
    success: true,
    message: "Пароль успешно изменён",
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandler, request, "POST /api/auth/reset-password-confirm");
}
