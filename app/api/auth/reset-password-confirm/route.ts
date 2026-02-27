import { resetPassword } from "@/modules/auth/lib/db";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { validateRequestBody } from "@/shared/lib/api/validate-request-body";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { resetPasswordConfirmSchema } from "@/shared/lib/validation/zod-schemas";
import { NextRequest, NextResponse } from "next/server";

async function postHandler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const bodyResult = await validateRequestBody(request, resetPasswordConfirmSchema);
  if ("error" in bodyResult) return bodyResult.error;
  const { token, password } = bodyResult.data;

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
