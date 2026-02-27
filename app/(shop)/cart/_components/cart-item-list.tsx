"use client";

import { CART_LABELS } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import type { DTO } from "@/shared/services";
import { CartItemCard } from "./cart-item-card";

type CartItemListProps = {
  items: DTO.CartItemDto[];
  className?: string;
};

/**
 * Список карточек товаров в корзине.
 * При количестве > 3 появляется скролл.
 */
export const CartItemList = ({ items, className }: CartItemListProps) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[16px] font-normal leading-[150%] text-text-secondary">
        {CART_LABELS.emptyList}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-235 max-[1080px]:w-full flex flex-col pr-2",
        // Скролл появляется при > 3 карточках
        items.length > 3 && "max-h-212 overflow-y-auto cart-scrollbar",
        className
      )}
    >
      {items.map((item, index) => (
        <div key={item.id}>
          <CartItemCard item={item} />
          {index < items.length - 1 && <div className="w-full h-0.75 bg-primary my-8" />}
        </div>
      ))}
    </div>
  );
};
