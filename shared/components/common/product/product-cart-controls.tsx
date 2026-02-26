"use client";

import { CART_ACTIONS } from "@/shared/constants";
import { cn } from "@/shared/lib";
import { Loader2, Minus, Plus } from "lucide-react";

interface ProductCartControlsProps {
  isInCart: boolean;
  currentQty: number;
  canAddToCart: boolean;
  isCartLoading: boolean;
  onAddToCart: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

/**
 * Контролы корзины для карточки товара: кнопка добавления или +/- количество.
 */
export function ProductCartControls({
  isInCart,
  currentQty,
  canAddToCart,
  isCartLoading,
  onAddToCart,
  onIncrease,
  onDecrease,
}: ProductCartControlsProps) {
  return (
    <div className="space-y-4">
      {isInCart ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={onDecrease}
              disabled={isCartLoading || currentQty <= 1}
              className="p-3 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Уменьшить количество"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="px-4 py-3 font-medium min-w-[3rem] text-center">
              {currentQty}
            </span>

            <button
              onClick={onIncrease}
              disabled={isCartLoading}
              className="p-3 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Увеличить количество"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <span className="text-sm text-muted-foreground">В корзине</span>
        </div>
      ) : (
        <button
          onClick={onAddToCart}
          disabled={!canAddToCart || isCartLoading}
          className={cn(
            "w-full py-4 px-6 font-medium rounded-lg transition-all duration-200",
            canAddToCart && !isCartLoading
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isCartLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            CART_ACTIONS.addToCart
          )}
        </button>
      )}
    </div>
  );
}
