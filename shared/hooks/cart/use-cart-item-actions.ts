"use client";

import { TOAST } from "@/shared/constants";
import type { DTO } from "@/shared/services";
import { useCallback } from "react";
import { toast } from "sonner";
import { useDeleteCartItemMutation, useUpdateCartItemMutation } from "./cart.hooks";

/**
 * Хук для мутаций позиции корзины: уменьшение/увеличение количества и удаление.
 * Используется в CartItemCard и CheckoutSummaryItem.
 *
 * Handlers обёрнуты в useCallback для предотвращения ненужных перерендеров
 * дочерних компонентов, которые принимают эти функции как props.
 */
export function useCartItemActions(item: DTO.CartItemDto) {
  const updateMutation = useUpdateCartItemMutation();
  const deleteMutation = useDeleteCartItemMutation();

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  const handleDelete = useCallback(() => {
    deleteMutation.mutate(item.id, {
      onError: () => toast.error(TOAST.ERROR.CART_ITEM_DELETE),
    });
  }, [deleteMutation, item.id]);

  const handleDecrease = useCallback(() => {
    if (item.qty <= 1) {
      handleDelete();
      return;
    }
    updateMutation.mutate(
      { id: item.id, qty: item.qty - 1 },
      { onError: () => toast.error(TOAST.ERROR.CART_ITEM_UPDATE) },
    );
  }, [item.id, item.qty, updateMutation, handleDelete]);

  const handleIncrease = useCallback(() => {
    updateMutation.mutate(
      { id: item.id, qty: item.qty + 1 },
      { onError: () => toast.error(TOAST.ERROR.CART_ITEM_UPDATE) },
    );
  }, [item.id, item.qty, updateMutation]);

  return { handleDecrease, handleIncrease, handleDelete, isBusy };
}
