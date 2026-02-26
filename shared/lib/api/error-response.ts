/**
 * Вспомогательные функции для создания унифицированных ErrorResponse
 */

import type { ErrorResponse, ErrorField } from "@/shared/dto";
import { NextResponse } from "next/server";

/**
 * Создаёт ErrorResponse с базовым сообщением
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  code?: string,
): NextResponse<ErrorResponse> {
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      message,
      ...(code && { code }),
    },
    { status },
  );
}

/**
 * Создаёт ErrorResponse с ошибками валидации
 */
export function createValidationErrorResponse(
  message: string,
  errors: ErrorField[],
  status: number = 422,
): NextResponse<ErrorResponse> {
  return NextResponse.json<ErrorResponse>(
    {
      success: false,
      message,
      errors,
    },
    { status },
  );
}

