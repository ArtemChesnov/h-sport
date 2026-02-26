/**
 * Валидация продуктов для админки
 */

export { getItemFieldName, isNonEmptyString, isPositiveInt } from "./product-helpers";
export {
    ALLOWED_SIZES, MAX_NAME_LENGTH, MAX_PRICE_VALUE, MAX_SKU_LENGTH, MAX_SLUG_LENGTH, SKU_REGEX, SLUG_REGEX
} from "./product-types";
export type { BaseFieldOptions, ItemValidationContext } from "./product-types";
export { validateProductCreate, validateProductUpdate } from "./product.lib";

