"use client";

import { OrderSummaryBlock, SummaryCardLayout } from "@/shared/components/common";
import { CartSummaryPromoInput } from "@/shared/components/common/cart/cart-summary-promo-input";
import { DesignButton } from "@/shared/components/ui/design-button";
import { CART_ACTIONS } from "@/shared/constants";
import { useShopNav } from "@/shared/contexts";
import Link from "next/link";
import React from "react";

type CartSummaryCardProps = {
  subtotal: number;
  discount: number;
  deliveryCost?: number;
  appliedCode?: string | null;
  onPromoApplied?: () => void;
  onPromoCleared?: () => void;
};

/**
 * Карточка с итогами заказа для страницы корзины
 */
export const CartSummaryCard: React.FC<CartSummaryCardProps> = ({
  subtotal,
  discount,
  deliveryCost,
  appliedCode,
  onPromoApplied,
  onPromoCleared,
}) => {
  const { setPendingPath } = useShopNav();

  return (
    <SummaryCardLayout
      title="Ваш заказ"
      summary={
        <OrderSummaryBlock
          subtotal={subtotal}
          discount={discount}
          deliveryCost={deliveryCost}
          appliedCode={appliedCode}
          promoInput={
            <CartSummaryPromoInput
              subtotal={subtotal}
              appliedCode={appliedCode}
              onApplied={onPromoApplied}
              onCleared={onPromoCleared}
            />
          }
          actions={
            <div className="flex flex-col gap-4 mt-10">
              <Link href="/checkout" className="flex-1" onClick={() => setPendingPath("/checkout")}>
                <DesignButton
                  variant="default"
                  className="w-full h-14 rounded-[10px] border-0 text-base"
                >
                  {CART_ACTIONS.checkout}
                </DesignButton>
              </Link>
              <Link href="/catalog" className="flex-1">
                <DesignButton
                  variant="outline"
                  className="w-full h-14 rounded-[10px] border-neutral-300 text-base"
                >
                  {CART_ACTIONS.continueShopping}
                </DesignButton>
              </Link>
            </div>
          }
        />
      }
      containerClassName="w-full min-[1081px]:min-w-114 min-[1081px]:max-w-175 justify-between min-h-53"
    />
  );
};
