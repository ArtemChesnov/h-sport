"use client";

import { CartItemDisplay } from "@/shared/components/common/cart/cart-item-display";
import type { DTO } from "@/shared/services";
import { cn } from "@/shared/lib/utils";
type CartItemCardProps = {
  item: DTO.CartItemDto;
  className?: string;
};

export const CartItemCard = ({ item, className }: CartItemCardProps) => {
  return (
    <CartItemDisplay
      item={item}
      className={cn(className, "pb-5")}
      imageClassName="max-[460px]:w-full max-[460px]:h-[320px] max-[460px]:aspect-square min-[461px]:w-[150px] min-[461px]:h-[150px] min-[769px]:w-[200px] min-[769px]:h-[200px] min-[1441px]:w-[240px] min-[1441px]:h-[240px]"
      imageSizes="(max-width: 768px) 150px, (max-width: 1440px) 200px, 240px"
    />
  );
};
