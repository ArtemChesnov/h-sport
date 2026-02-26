"use client";

import { OrderItemDisplay } from "@/shared/components/common/cart/order-item-display";
import type { DTO } from "@/shared/services";

interface OrderDetailItemProps {
  item: DTO.OrderItemDto;
  className?: string;
}

/**
 * Карточка товара в детали заказа (readonly).
 * Обёртка над OrderItemDisplay без actions.
 */
export function OrderDetailItem({ item, className }: OrderDetailItemProps) {
  return (
    <OrderItemDisplay
      item={item}
      className={className}
      imageClassName="w-[150px] h-[150px] max-[576px]:w-24 max-[576px]:h-24"
      imageSizes="(max-width: 576px) 96px, 150px"
    />
  );
}
