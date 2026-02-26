/**
 * POST /api/errors/client
 * Логирование ошибок с клиента (для ErrorBoundary)
 */

import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { validateRequestSize } from "@/shared/lib/api/error-handler";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimitResponse = await applyRateLimit(request, "clientErrors");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 50 * 1024);
  if (!sizeCheck.valid) {
    return sizeCheck.response;
  }

  try {
    const body = await request.json();
    const { message, stack, componentStack } = body;

    // Логируем ошибку с клиента через logger (requestId для трассировки)
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

    const { logger } = await import("@/shared/lib/logger");
    logger.error("[ERROR] Client-side error from ErrorBoundary", errorData);

    // Записываем в файл через logger-enhanced (только на сервере, без React)
    if (typeof window === "undefined") {
      try {
        const { loggerEnhanced } = await import("@/shared/lib/logger-enhanced");
        loggerEnhanced.error("Client-side error from ErrorBoundary", new Error(message), errorData);
      } catch {
        // Игнорируем ошибки загрузки улучшенного логгера
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    // Игнорируем ошибки логирования
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
