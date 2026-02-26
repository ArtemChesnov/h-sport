/**
 * Экспорты модуля промокодов
 */

export { formatDiscountDisplay } from "./format-discount-display";
export { calculatePromoDiscount } from "./promo-calculation.lib";
export {
    PromoValidationError, validateMinOrder, validatePromoActive, validatePromoCode, validatePromoDates, validatePromoFields, validatePromoForSubtotal, validatePromoType,
    validatePromoValue, validateUsageLimit, type PromoForValidation
} from "./validate-promo";

