import type * as DTO from "../../../dto";
import {ApiRoutes, axiosInstance, buildCartItemUrl} from "../../../http";
import {getApiErrorMessage} from "../../api-errors";

/**
 * Текущая корзина.
 *
 * GET /api/shop/cart
 */
export async function fetchCart(): Promise<DTO.CartDto> {
  try {
    const { data } = await axiosInstance.get<DTO.CartDto>(ApiRoutes.CART);
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось загрузить корзину"),
    );
  }
}

/**
 * Добавить позицию в корзину.
 *
 * POST /api/shop/cart/items
 */
export async function addCartItem(
    payload: DTO.CartAddItemDto,
): Promise<DTO.CartDto> {
  try {
    const { data } = await axiosInstance.post<DTO.CartDto>(
        ApiRoutes.CART_ITEMS,
        payload,
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось добавить товар в корзину"),
    );
  }
}

/**
 * Обновить позицию корзины.
 *
 * PATCH /api/shop/cart/items/:id
 */
export async function updateCartItem(
    cartItemId: number,
    payload: DTO.CartUpdateItemDto,
): Promise<DTO.CartDto> {
  try {
    const { data } = await axiosInstance.patch<DTO.CartDto>(
        buildCartItemUrl(cartItemId),
        payload,
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось обновить товар в корзине"),
    );
  }
}

/**
 * Удалить позицию корзины.
 *
 * DELETE /api/shop/cart/items/:id
 */
export async function deleteCartItem(cartItemId: number): Promise<DTO.CartDto> {
  try {
    const { data } = await axiosInstance.delete<DTO.CartDto>(
        buildCartItemUrl(cartItemId),
    );
    return data;
  } catch (error) {
    throw new Error(
        getApiErrorMessage(error, "Не удалось удалить товар из корзины"),
    );
  }
}
