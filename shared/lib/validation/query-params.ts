/**
 * Утилиты для валидации query-параметров
 */

/**
 * Валидирует и ограничивает длину строки
 * @param value - значение для валидации
 * @param maxLength - максимальная длина (по умолчанию 200)
 * @returns Обрезанная строка или undefined
 */
export function validateAndLimitStringLength(
  value: string | null | undefined,
  maxLength: number = 200,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

/**
 * Валидирует и ограничивает длину email
 */
export function validateEmailQuery(value: string | null | undefined): string | undefined {
  return validateAndLimitStringLength(value, 255);
}

/**
 * Валидирует и ограничивает длину телефона
 */
export function validatePhoneQuery(value: string | null | undefined): string | undefined {
  return validateAndLimitStringLength(value, 20);
}

/**
 * Валидирует и ограничивает длину UID
 */
export function validateUidQuery(value: string | null | undefined): string | undefined {
  return validateAndLimitStringLength(value, 200);
}

/**
 * Валидирует и ограничивает длину slug
 */
export function validateSlugQuery(value: string | null | undefined): string | undefined {
  return validateAndLimitStringLength(value, 100);
}
