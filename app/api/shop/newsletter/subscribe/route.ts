import { sendNewsletterConfirmationEmailAsync } from "@/modules/auth/lib/email";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getSubscriptionToken, subscribe } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

async function postHandler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const body = (await request.json()) as { email?: string; consent?: boolean; source?: string };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const consent = Boolean(body.consent);

  if (!consent) {
    return createErrorResponse("Необходимо согласие на получение рассылки", 400);
  }

  const result = await subscribe({
    email,
    source: body.source ?? "footer",
  });

  if (!result.ok) {
    return createErrorResponse(result.message, 400);
  }

  if (result.needConfirmation) {
    const token = await getSubscriptionToken(email);
    if (token) {
      sendNewsletterConfirmationEmailAsync(email, token);
    }
  }

  return NextResponse.json(
    {
      success: true,
      message: result.needConfirmation
        ? "На указанный email отправлено письмо для подтверждения подписки."
        : "Вы уже подписаны на рассылку.",
    },
    { status: 200 },
  );
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ErrorResponse | { success: true; message: string }>> {
  return withErrorHandling(postHandler, request, "POST /api/shop/newsletter/subscribe");
}
