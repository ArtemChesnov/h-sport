/**
 * Типы для валидации продуктов
 */

/**
 * Базовые настройки для валидации простого поля.
 */
export type BaseFieldOptions = {
  field?: string;
  optional?: boolean;
};

/**
 * Контекст валидации одного варианта товара (item).
 */
export type ItemValidationContext = {
  prefix: string;
  combos: Set<string>;
  skuSet: Set<string>;
};

/**
 * Константы валидации
 */
export const MAX_NAME_LENGTH = 255;
export const MAX_SLUG_LENGTH = 255;
export const MAX_SKU_LENGTH = 64;
export const MAX_PRICE_VALUE = 10_000_000;

/**
 * Разрешённые значения размеров.
 */
export const ALLOWED_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "ONE_SIZE"] as const;

/**
 * Допустимый формат slug.
 */
export const SLUG_REGEX = /^[a-z0-9-]+$/;

/**
 * Допустимый формат SKU.
 */
export const SKU_REGEX = /^[A-Z0-9-_]+$/i;
