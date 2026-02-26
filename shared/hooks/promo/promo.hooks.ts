"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {DTO, PROMO_CLIENT} from "@/shared/services";
import {CART_QUERY_KEY} from "@/shared/hooks/cart/cart.hooks";

/**
 * Мутация для применения промокода к текущей корзине.
 *
 * Возвращает актуальную CartDto и сразу кладёт её в кэш ["cart"].
 */
export function useApplyPromoCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation<DTO.CartDto, unknown, DTO.PromoCodeApplyRequestDto>({
    mutationKey: ["cart-apply-promo"],
    mutationFn: (payload) => PROMO_CLIENT.applyPromoCode(payload),

    onSuccess: (cart) => {
      // синхронизируем кэш корзины
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}

/**
 * Мутация для сброса промокода у текущей корзины.
 *
 * Тоже возвращает актуальную CartDto и обновляет кэш ["cart"].
 */
export function useClearPromoCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation<DTO.CartDto, unknown, void>({
    mutationKey: ["cart-clear-promo"],
    mutationFn: () => PROMO_CLIENT.clearPromoCode(),

    onSuccess: (cart) => {
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
  });
}
