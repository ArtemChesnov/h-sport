"use client";

import { CartItemDisplay } from "@/shared/components/common/cart/cart-item-display";
import type { DTO } from "@/shared/services";

interface CheckoutSummaryItemProps {
  item: DTO.CartItemDto;
  /** Дизейблить управление количеством и удаление */
  disabled?: boolean;
  className?: string;
}

export function CheckoutSummaryItem({ item, disabled, className }: CheckoutSummaryItemProps) {
  return (
    <CartItemDisplay
      item={item}
      className={className}
      disabled={disabled}
      imageClassName="w-[160px] h-[170px]"
      imageSizes="160px"
    />
  );
}
