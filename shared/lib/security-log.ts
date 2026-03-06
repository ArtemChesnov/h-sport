/**
 * Запись событий безопасности и логов в БД.
 * Используется: неудачные логины, rate limit, неверная подпись, webhook-вызовы, клиентские ошибки.
 */

import { prisma } from "@/prisma/prisma-client";
import { SecurityEventType, WebhookResultType } from "@prisma/client";

const MAX_DETAILS_SIZE = 2000;

function truncate(str: string | undefined, max: number): string | undefined {
  if (!str) return undefined;
  if (str.length <= max) return str;
  return str.slice(0, max) + "...";
}

function getDetailsSafe(details: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!details) return null;
  const str = JSON.stringify(details);
  if (str.length <= MAX_DETAILS_SIZE) return details;
  return { _truncated: true, _preview: str.slice(0, MAX_DETAILS_SIZE) };
}

/**
 * Извлекает IP из запроса (учитывает прокси)
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return null;
}

export function getUserAgent(request: Request): string | null {
  return request.headers.get("user-agent");
}

/**
 * Записывает событие безопасности (не блокирует ответ)
 */
export async function recordSecurityEvent(params: {
  type: SecurityEventType;
  request: Request;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const ip = getClientIp(params.request);
    const userAgent = truncate(getUserAgent(params.request) ?? undefined, 500);
    await prisma.securityEvent.create({
      data: {
        type: params.type,
        ip: ip ?? undefined,
        userAgent: userAgent ?? undefined,
        details: getDetailsSafe(params.details ?? null) as object | undefined,
      },
    });
  } catch (err) {
    // Не ломаем основной поток при ошибке записи лога
    const { logger } = await import("@/shared/lib/logger");
    logger.warn("[SecurityLog] Failed to record security event", { type: params.type, err });
  }
}

/**
 * Записывает вызов webhook (не блокирует ответ)
 */
export async function recordWebhookLog(params: {
  source: string;
  request: Request;
  invId: string | null;
  result: WebhookResultType;
  message?: string | null;
}): Promise<void> {
  try {
    const ip = getClientIp(params.request);
    await prisma.webhookLog.create({
      data: {
        source: params.source,
        ip: ip ?? undefined,
        invId: params.invId ?? undefined,
        result: params.result,
        message: truncate(params.message ?? undefined, 500) ?? undefined,
      },
    });
  } catch (err) {
    const { logger } = await import("@/shared/lib/logger");
    logger.warn("[WebhookLog] Failed to record webhook log", { source: params.source, err });
  }
}

/**
 * Записывает клиентскую ошибку (ErrorBoundary)
 */
export async function recordClientError(params: {
  message: string;
  stack?: string | null;
  componentStack?: string | null;
  userAgent?: string | null;
  url?: string | null;
}): Promise<void> {
  try {
    await prisma.clientErrorLog.create({
      data: {
        message: params.message.slice(0, 50_000),
        stack: params.stack?.slice(0, 50_000) ?? undefined,
        componentStack: params.componentStack?.slice(0, 50_000) ?? undefined,
        userAgent: truncate(params.userAgent ?? undefined, 500) ?? undefined,
        url: truncate(params.url ?? undefined, 2000) ?? undefined,
      },
    });
  } catch (err) {
    const { logger } = await import("@/shared/lib/logger");
    logger.warn("[ClientErrorLog] Failed to record client error", { err });
  }
}
