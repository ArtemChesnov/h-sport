
import type { FieldError } from "../validation";
import { extractBackendErrorPayload } from "../validation";

/**
 * Безопасно извлекает текст ошибки для отображения пользователю.
 * Приоритет:
 *   1) первый message из errors[]
 *   2) общий message
 *   3) Error.message / строка
 *   4) дефолтный текст
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = "Произошла ошибка. Попробуй ещё раз.",
): string {
  const {message, errors} = extractBackendErrorPayload(error);

  if (Array.isArray(errors) && errors.length > 0) {
    const firstWithText = errors.find(
      (e: FieldError) => typeof e.message === "string" && e.message.trim().length > 0,
    );
    if (firstWithText) return firstWithText.message;
  }

  if (message && message.trim().length > 0) {
    return message;
  }

  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;

  return fallback;
}



