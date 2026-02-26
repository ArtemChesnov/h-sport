/**
 * Вспомогательные функции для валидации продуктов
 */

/**
 * Проверяет, что значение — непустая строка (после trim).
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Проверяет, что значение — положительное целое число.
 */
export function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * Вспомогательный хелпер для сборки имени поля вида: `${prefix}.${subField}`
 */
export function getItemFieldName(ctx: { prefix: string }, subField: string): string {
  return `${ctx.prefix}.${subField}`;
}
