"use client";

import { Button } from "@/shared/components/ui/button";
import { DesignButton } from "@/shared/components/ui/design-button";
import { CART_ACTIONS } from "@/shared/constants";
import { cn } from "@/shared/lib";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface ProductCartControlsNewProps {
  isInCart: boolean;
  currentQty: number;
  canAddToCart: boolean;
  isCartLoading: boolean;
  onAddToCart: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  className?: string;
}

/**
 * Новые контролы корзины для страницы товара
 * С плавной анимацией при переключении состояний
 */
export function ProductCartControlsNew({
  isInCart,
  currentQty,
  canAddToCart,
  isCartLoading,
  onAddToCart,
  onIncrease,
  onDecrease,
  className,
}: ProductCartControlsNewProps) {
  return (
    <div className={cn("relative h-14", className)}>
      {/* Кнопка "Добавить в корзину" */}
      <div
        className={cn(
          "absolute inset-0 transition-all duration-300 ease-out",
          isInCart
            ? "opacity-0 scale-95 pointer-events-none"
            : "opacity-100 scale-100"
        )}
      >
        <DesignButton
          onClick={onAddToCart}
          disabled={!canAddToCart || isCartLoading}
          variant="default"
          className="w-full h-full"
        >
          {isCartLoading && !isInCart ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            CART_ACTIONS.addToCart
          )}
        </DesignButton>
      </div>

      {/* Контролы корзины */}
      <div
        className={cn(
          "absolute inset-0 flex gap-5 transition-all duration-300 ease-out",
          isInCart
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <DesignButton className="flex-1" variant="default" asChild>
          <Link href="/cart">Перейти в корзину</Link>
        </DesignButton>
        <div className="border border-primary rounded-[10px] w-fit flex items-center gap-[7px] px-[5px] h-14 shrink-0">
          <Button
            variant="ghost"
            onClick={onDecrease}
            disabled={isCartLoading}
            className="w-[34px] text-[30px] font-normal px-2 py-2 h-10 cursor-pointer disabled:opacity-50"
            aria-label="Уменьшить количество"
          >
            −
          </Button>
          <span className="text-[30px] font-normal px-2 py-2 min-w-[40px] text-center">
            {currentQty}
          </span>
          <Button
            variant="ghost"
            onClick={onIncrease}
            disabled={isCartLoading}
            className="text-[30px] w-[34px] font-normal px-2 py-2 h-10 cursor-pointer disabled:opacity-50"
            aria-label="Увеличить количество"
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );
}
