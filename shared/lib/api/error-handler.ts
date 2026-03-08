import { NextRequest, NextResponse } from "next/server";
import type { ErrorResponse } from "@/shared/dto";
import { logger } from "@/shared/lib/logger";
import { isAppError, toAppError, ValidationError } from "@/shared/lib/errors/custom-errors";
import { alert5xx } from "@/shared/lib/alerts";
import { ZodError } from "zod";
import type { FieldError } from "@/shared/lib/validation";
import { createErrorResponse } from "./error-response";

/**
 * Обёртка для обработки ошибок в API routes (для простых routes без динамических параметров).
 * Логирует ошибку и возвращает стандартизированный ответ.
 * Поддерживает кастомные классы ошибок, Zod ошибки и Prisma ошибки.
 * Handler может возвращать успешный ответ (NextResponse<T>) или любой ответ с ошибкой (например от requireAdmin или rate limit).
 */
export async function withErrorHandling<T>(
  handler: (
    request: NextRequest
  ) => Promise<NextResponse<T> | NextResponse<ErrorResponse> | NextResponse<unknown>>,
  request: NextRequest,
  routeName: string
): Promise<NextResponse<T | ErrorResponse>> {
  try {
    return (await handler(request)) as NextResponse<T | ErrorResponse>;
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse<ErrorResponse>;
    }
    // Обрабатываем Zod ошибки отдельно
    if (error instanceof ZodError) {
      const fieldErrors: FieldError[] = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      const firstIssue = error.issues[0];
      const validationError = new ValidationError(
        firstIssue?.message || "Ошибка валидации данных",
        fieldErrors
      );

      logger.warn(
        `[${routeName}] Ошибка валидации: ${validationError.message}`,
        {
          code: validationError.code,
          statusCode: validationError.statusCode,
          fieldErrors: fieldErrors.length,
        },
        {
          requestId: request.headers.get("x-request-id") ?? undefined,
          route: routeName,
          method: request.method,
          url: request.url,
        }
      );

      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          message: validationError.message,
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    // Преобразуем ошибку в AppError для безопасной обработки
    const appError = toAppError(error, "Внутренняя ошибка сервера");

    // Логируем с контекстом запроса (requestId для трассировки в логах)
    const requestContext = {
      requestId: request.headers.get("x-request-id") ?? undefined,
      route: routeName,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    };

    // Для ошибок подключения к БД логируем как warn (это временная проблема)
    // Для других операционных ошибок - warn
    // Для системных ошибок - error
    if (appError.code === "DATABASE_CONNECTION_ERROR") {
      logger.warn(
        `[${routeName}] Ошибка подключения к БД: ${appError.message}`,
        {
          code: appError.code,
          statusCode: appError.statusCode,
          ...appError.context,
        },
        requestContext
      );
    } else if (appError.isOperational) {
      logger.warn(
        `[${routeName}] Операционная ошибка: ${appError.message}`,
        {
          code: appError.code,
          statusCode: appError.statusCode,
          ...appError.context,
        },
        requestContext
      );
    } else {
      logger.error(
        `[${routeName}] Системная ошибка: ${appError.message}`,
        appError,
        {
          code: appError.code,
          statusCode: appError.statusCode,
          ...appError.context,
        },
        requestContext
      );
    }

    // Отправляем алерт для 5xx ошибок
    if (appError.statusCode >= 500) {
      alert5xx({
        statusCode: appError.statusCode,
        endpoint: routeName,
        method: request.method,
        message: appError.message,
        error: error instanceof Error ? error : undefined,
        ip: requestContext.ip,
        meta: {
          code: appError.code,
          ...appError.context,
        },
      });
    }

    // Формируем сообщение для пользователя
    let userMessage = appError.message;

    // Для ошибок подключения к БД - более понятное сообщение
    if (appError.code === "DATABASE_CONNECTION_ERROR") {
      userMessage = "Сервис временно недоступен. Пожалуйста, попробуйте позже.";
    } else if (!appError.isOperational) {
      // Для системных ошибок не показываем детали пользователю
      userMessage = "Внутренняя ошибка сервера";
    }

    // Возвращаем ответ с соответствующим статус-кодом
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        message: userMessage,
        ...(isAppError(error) && error.code && { code: error.code }),
      },
      { status: appError.statusCode }
    );
  }
}

/**
 * Валидация размера тела запроса.
 * @param request - NextRequest объект
 * @param maxSizeBytes - максимальный размер в байтах (по умолчанию 1MB)
 */
export function validateRequestSize(
  request: NextRequest,
  maxSizeBytes: number = 1024 * 1024 // 1MB
): { valid: true } | { valid: false; response: NextResponse<ErrorResponse> } {
  const contentLength = request.headers.get("content-length");

  if (contentLength) {
    const size = parseInt(contentLength, 10);

    if (size > maxSizeBytes) {
      return {
        valid: false,
        response: createErrorResponse(
          `Размер запроса превышает максимально допустимый (${Math.round(maxSizeBytes / 1024)}KB)`,
          413
        ),
      };
    }
  }

  return { valid: true };
}
