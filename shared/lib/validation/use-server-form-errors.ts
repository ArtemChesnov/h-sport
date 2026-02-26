"use client";

import {useCallback, useState} from "react";
import type {FieldError, FormErrorsRecord, NestedFormErrors,} from "./map-fields-errors";
import {mapFieldErrorsToForm, mapFieldErrorsToNestedFormErrors,} from "./map-fields-errors";

/**
 * Базовый формат ответа бэкенда с ошибками.
 *
 * Совместим с твоими Product-эндпоинтами:
 *   {
 *     message: "Validation error",
 *     errors: FieldError[]
 *   }
 */
type BackendErrorPayload = {
  message?: string;
  errors?: FieldError[];
};

type ErrorWithResponse = {
  response?: {
    data?: unknown;
  };
};

function isFieldError(value: unknown): value is FieldError {
  if (typeof value !== "object" || value === null) return false;

  const maybe = value as { field?: unknown; message?: unknown };

  return (
      typeof maybe.field === "string" &&
      typeof maybe.message === "string" &&
      maybe.field.length > 0
  );
}

/**
 * Пытаемся вытащить payload с ошибками из любого error-объекта.
 *
 * Ориентируемся на axios-ошибку:
 *   error.response.data.message
 *   error.response.data.errors
 */
export function extractBackendErrorPayload(
    error: unknown,
): BackendErrorPayload {
  const withResponse = error as ErrorWithResponse;
  const data = withResponse.response?.data;

  if (!data || typeof data !== "object") {
    return {};
  }

  const raw = data as {
    message?: unknown;
    errors?: unknown;
  };

  const message =
      typeof raw.message === "string" ? raw.message : undefined;

  const errorsArray = Array.isArray(raw.errors) ? raw.errors : undefined;
  const errors =
      errorsArray && errorsArray.length > 0
          ? (errorsArray.filter(isFieldError) as FieldError[])
          : undefined;

  return { message, errors };
}

/**
 * Хук для работы с плоскими ошибками формы:
 *
 *   FieldError[] → FormErrorsRecord → показ в инпутах.
 */
export function useServerFormErrors() {
  const [formErrors, setFormErrors] = useState<FormErrorsRecord>({});

  const resetFormErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  const handleServerError = useCallback((error: unknown) => {
    const { errors, message } = extractBackendErrorPayload(error);

    if (errors && errors.length > 0) {
      setFormErrors(mapFieldErrorsToForm(errors));
      return;
    }

    if (message) {
      setFormErrors({ _global: message });
      return;
    }

    setFormErrors({
      _global: "Что-то пошло не так. Попробуй ещё раз.",
    });
  }, []);

  return {
    formErrors,
    setFormErrors,
    resetFormErrors,
    handleServerError,
  };
}

/**
 * Хук для nested-ошибок:
 *
 *   FieldError[] → NestedFormErrors → ошибки по items[index].
 */
export function useServerNestedFormErrors() {
  const [errorsTree, setErrorsTree] = useState<NestedFormErrors>({});

  const resetFormErrors = useCallback(() => {
    setErrorsTree({});
  }, []);

  const handleServerError = useCallback((error: unknown) => {
    const { errors, message } = extractBackendErrorPayload(error);

    if (errors && errors.length > 0) {
      setErrorsTree(mapFieldErrorsToNestedFormErrors(errors));
      return;
    }

    if (message) {
      setErrorsTree({ _global: message });
      return;
    }

    setErrorsTree({
      _global: "Что-то пошло не так. Попробуй ещё раз.",
    });
  }, []);

  return {
    errorsTree,
    setErrorsTree,
    resetFormErrors,
    handleServerError,
  };
}
