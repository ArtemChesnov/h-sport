/**
 * Парсер полевых ошибок из ответа API (ErrorResponse).
 * Единая точка для приведения ответа 422 к формату полей формы.
 */

import type { FieldError, FormErrorsRecord } from "@/shared/lib/validation/map-fields-errors";
import { mapFieldErrorsToForm } from "@/shared/lib/validation/map-fields-errors";
import type { ErrorField } from "@/shared/dto";

/** Результат разбора ответа с ошибками валидации */
export interface ParsedFieldErrors {
  /** Ошибки по полям: ключ — имя поля, значение — сообщение(я) */
  fieldErrors: FormErrorsRecord;
  /** Общее сообщение формы (message из ErrorResponse или _global) */
  formError?: string;
}

function isErrorField(value: unknown): value is ErrorField {
  if (typeof value !== "object" || value === null) return false;
  const o = value as { field?: unknown; message?: unknown };
  return typeof o.message === "string";
}

/**
 * Извлекает полевые ошибки из ответа сервера (тело ответа или error.response?.data).
 *
 * Вход: unknown — обычно JSON от fetch/axios (ErrorResponse или { response: { data } }).
 * Выход: { fieldErrors, formError } для подсветки инпутов и общего сообщения.
 *
 * @example
 * const res = await fetch(...);
 * const body = await res.json();
 * if (res.status === 422) {
 *   const { fieldErrors, formError } = parseFieldErrors(body);
 *   setFormErrors(fieldErrors);
 *   if (formError) toast.error(formError);
 * }
 */
export function parseFieldErrors(payload: unknown): ParsedFieldErrors {
  let data = payload;

  // Поддержка axios-ошибки: error.response?.data
  if (payload && typeof payload === "object" && "response" in payload) {
    const withResponse = payload as { response?: { data?: unknown } };
    data = withResponse.response?.data;
  }

  if (!data || typeof data !== "object") {
    return { fieldErrors: {} };
  }

  const raw = data as { message?: unknown; errors?: unknown };
  const message = typeof raw.message === "string" ? raw.message : undefined;
  const errorsArray = Array.isArray(raw.errors) ? raw.errors : undefined;
  const errors: ErrorField[] =
    errorsArray && errorsArray.length > 0
      ? (errorsArray.filter(isErrorField) as ErrorField[])
      : [];

  const fieldErrors = mapFieldErrorsToForm(errors as FieldError[]);
  const formError = message ?? (fieldErrors._global as string | undefined);

  return {
    fieldErrors,
    formError: formError || undefined,
  };
}
