/**
 * POST /api/errors/client
 * Логирование ошибок с клиента (для ErrorBoundary)
 */

import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { logger } from "@/shared/lib/logger";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest): Promise<NextResponse> {
  const rateLimitResponse = await applyRateLimit(request, "clientErrors");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 50 * 1024);
  if (!sizeCheck.valid) {
    return sizeCheck.response;
  }

  const body = await request.json();
  const { message, stack, componentStack } = body;

  const errorData = {
    message: "Client-side error from ErrorBoundary",
    requestId: request.headers.get("x-request-id") ?? undefined,
    error: message,
    stack,
    componentStack,
    userAgent: request.headers.get("user-agent"),
    url: request.headers.get("referer"),
    timestamp: new Date().toISOString(),
  };

  logger.error("[ERROR] Client-side error from ErrorBoundary", new Error(message), errorData);

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    return await withErrorHandling(handler, request, "POST /api/errors/client");
  } catch {
    return createErrorResponse("Ошибка при сохранении лога", 500);
  }
}
