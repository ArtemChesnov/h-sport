import type * as DTO from "../../../dto";
import {ApiRoutes, axiosInstance} from "../../../http";
import {getApiErrorMessage} from "../../api-errors";

/**
 * Применить промокод к корзине.
 *
 * POST /api/shop/cart/apply-promo
 * Возвращает актуальную CartDto.
 */
export async function applyPromoCode(
    payload: DTO.PromoCodeApplyRequestDto,
): Promise<DTO.CartDto> {
  try {
    const { data } = await axiosInstance.post<DTO.CartDto>(
        ApiRoutes.CART_APPLY_PROMO,
        payload,
    );

    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось применить промокод"),
    );
  }
}

/**
 * Сбросить промокод у текущей корзины.
 *
 * POST /api/shop/cart/clear-promo
 * Тоже возвращает актуальную CartDto.
 */
export async function clearPromoCode(): Promise<DTO.CartDto> {
  try {
    const { data } = await axiosInstance.post<DTO.CartDto>(
        ApiRoutes.CART_CLEAR_PROMO,
    );

    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось сбросить промокод"),
    );
  }
}
