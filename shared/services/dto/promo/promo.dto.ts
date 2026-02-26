import type {CartDto} from "../cart/cart.dto";

/**
 * Запрос на применение промокода.
 * code — обязательно; email/phone — опционально, но
 * если хотим per-user лимит для гостя, нужно передавать хотя бы email.
 */
export type PromoCodeApplyRequestDto = {
  code: string;

  /**
   * Email покупателя на шаге чекаута.
   * Используется для проверки "этот промокод уже применялся этим email".
   */
  email?: string | null;

  /**
   * Телефон покупателя.
   * Можно использовать дополнительно к email, как ещё один идентификатор.
   */
  phone?: string | null;
};

/**
 * Ответ на применение промокода.
 *
 * Теперь это просто актуальная корзина с учётом скидки
 * и применённого промокода.
 */
export type PromoCodeApplyResponseDto = CartDto;
