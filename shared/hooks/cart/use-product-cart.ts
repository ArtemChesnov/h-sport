import { DTO } from "@/shared/services";
import { useIsHydrated } from "../common/use-is-hydrated";
import {
    useAddCartItemMutation,
    useCartQuery,
    useDeleteCartItemMutation,
    useUpdateCartItemMutation,
} from "./cart.hooks";

/**
 * Хук для работы с корзиной на странице товара (количество в корзине, добавить/увеличить/уменьшить).
 */
export function useProductCart(selectedItem: DTO.ProductItemDto | null) {
  const { data: cart } = useCartQuery();
  const addToCart = useAddCartItemMutation();
  const updateCartItem = useUpdateCartItemMutation();
  const deleteCartItem = useDeleteCartItemMutation();
  const isHydrated = useIsHydrated();

  const cartItem = cart?.items.find((item) => item.productItemId === selectedItem?.id) ?? null;
  const currentQty = cartItem?.qty ?? 0;
  const isInCart = isHydrated && currentQty > 0;

  const canAddToCart =
    !!selectedItem && selectedItem.isAvailable && !addToCart.isPending && !updateCartItem.isPending;

  function handleAddToCart() {
    if (!selectedItem) return;
    addToCart.mutate({ productItemId: selectedItem.id, qty: 1 });
  }

  function handleIncrease() {
    if (!selectedItem || !cartItem) return;
    updateCartItem.mutate({ id: cartItem.id, qty: cartItem.qty + 1 });
  }

  function handleDecrease() {
    if (!selectedItem || !cartItem) return;
    if (cartItem.qty <= 1) {
      deleteCartItem.mutate(cartItem.id);
      return;
    }
    updateCartItem.mutate({ id: cartItem.id, qty: cartItem.qty - 1 });
  }

  return {
    cartItem,
    currentQty,
    isInCart,
    canAddToCart,
    handleAddToCart,
    handleIncrease,
    handleDecrease,
    isLoading: addToCart.isPending || updateCartItem.isPending || deleteCartItem.isPending,
  };
}
