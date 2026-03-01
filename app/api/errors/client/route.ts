/**
 * POST /api/errors/client
 * Логирование ошибок с клиента (для ErrorBoundary)
 */

import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { logger } from "@/shared/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const clientErrorBodySchema = z.object({
  message: z.string().max(10_000),
  stack: z.string().max(50_000).optional(),
  componentStack: z.string().max(50_000).optional(),
});

async function handler(request: NextRequest): Promise<NextResponse> {
  const rateLimitResponse = await applyRateLimit(request, "clientErrors");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 50 * 1024);
  if (!sizeCheck.valid) {
    return sizeCheck.response;
  }

  const raw = await request.json();
  const parsed = clientErrorBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid body: message required" },
      { status: 400 }
    );
  }

  const { message, stack, componentStack } = parsed.data;

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
