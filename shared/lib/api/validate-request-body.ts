/**
 * Единый слой валидации тел запросов через Zod.
 * Парсит JSON, валидирует схемой, возвращает данные или стандартизированный ответ с ошибками.
 */

import type { ErrorField, ErrorResponse } from "@/shared/dto";
import {
  createErrorResponse,
  createValidationErrorResponse,
} from "@/shared/lib/api/error-response";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

type ZodSchema<T> = z.ZodType<T>;

export type ValidateBodyResult<T> = { data: T } | { error: NextResponse<ErrorResponse> };

/**
 * Читает тело запроса, парсит JSON и валидирует по Zod-схеме.
 * При ошибке парсинга или валидации возвращает { error: NextResponse } с единым форматом ErrorResponse.
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
  options?: { maxSize?: number }
): Promise<ValidateBodyResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: createErrorResponse("Некорректное тело запроса JSON", 400) };
  }

  const result = schema.safeParse(raw);
  if (result.success) {
    return { data: result.data };
  }

  const issues = result.error.issues;
  const errors: ErrorField[] = issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
  const firstMessage = issues[0]?.message ?? "Ошибка валидации";
  return {
    error: createValidationErrorResponse(firstMessage, errors, 422),
  };
}
