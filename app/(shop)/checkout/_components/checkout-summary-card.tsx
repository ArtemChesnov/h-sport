"use client";

import { OrderSummaryBlock, SummaryCardLayout } from "@/shared/components/common";
import { CartSummaryPromoInput } from "@/shared/components/common/cart/cart-summary-promo-input";
import { DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD_KOPECKS } from "@/shared/constants";
import { useCartQuery } from "@/shared/hooks";
import { useCheckoutAddress } from "@/shared/hooks/checkout/checkout.hooks";
import { useDeliveryCost } from "@/shared/hooks/shipping/useDeliveryCost";
import { cn } from "@/shared/lib/utils";
import { getDeliveryMethodFlags } from "@/shared/lib/checkout";
import { usePathname } from "next/navigation";
import React from "react";
import { CheckoutSummaryCardSkeleton } from "./checkout-skeletons";
import { CheckoutSummaryItem } from "./checkout-summary-item";

function isCalculableDeliveryMethod(method: string): boolean {
  return (
    method === "CDEK_PVZ" ||
    method === "CDEK_COURIER" ||
    method === "POCHTA_PVZ" ||
    method === "POCHTA_COURIER"
  );
}

/**
 * Карточка саммари заказа для чекаута.
 */
export const CheckoutSummaryCard: React.FC = () => {
  const pathname = usePathname();
  const { data: cart, isLoading } = useCartQuery();
  const { address } = useCheckoutAddress();

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const discount = cart?.discount ?? 0;
  const appliedCode = cart?.promoCode ?? null;

  const { data: deliveryCostData, isLoading: isDeliveryCostLoading } = useDeliveryCost({
    city: address.city,
    deliveryMethod: address.deliveryMethod,
    valuationRub: items.length ? Math.round((subtotal - discount) / 100) : undefined,
  });

  const isSuccessStep = pathname === "/checkout/success";

  if (isLoading) {
    return <CheckoutSummaryCardSkeleton />;
  }

  if (!cart || items.length === 0) {
    return null;
  }

  const { isPickup } = getDeliveryMethodFlags(address.deliveryMethod);
  const orderSum = subtotal - discount;

  let deliveryCost: number | undefined;
  if (isPickup) {
    deliveryCost = 0;
  } else if (orderSum >= FREE_DELIVERY_THRESHOLD_KOPECKS) {
    deliveryCost = 0;
  } else if (isCalculableDeliveryMethod(address.deliveryMethod)) {
    if (isDeliveryCostLoading && address.city.trim().length >= 2) {
      deliveryCost = undefined;
    } else if (deliveryCostData?.deliveryCostKopecks != null) {
      deliveryCost = deliveryCostData.deliveryCostKopecks;
    } else {
      deliveryCost = undefined;
    }
  } else {
    deliveryCost = DEFAULT_DELIVERY_FEE;
  }

  return (
    <SummaryCardLayout
      title="Ваш заказ"
      containerClassName="w-200 shrink-0 max-[1600px]:w-full max-[1600px]:shrink"
      itemsList={
        <>
          {items.map((item, index) => (
            <div key={item.id}>
              <CheckoutSummaryItem item={item} disabled={isSuccessStep} />
              {index < items.length - 1 && <div className="w-full h-0.75 bg-primary my-4" />}
            </div>
          ))}
        </>
      }
      itemsListClassName={cn(
        items.length > 2 && "max-h-[450px] overflow-y-auto cart-scrollbar pr-2"
      )}
      summary={
        <div className="mt-9 bg-[#F4F0F0] h-fit w-175 max-[1600px]:w-full flex flex-col rounded-[10px]">
          <OrderSummaryBlock
            subtotal={subtotal}
            discount={discount}
            deliveryCost={deliveryCost}
            deliveryPeriodMin={deliveryCostData?.periodMin}
            deliveryPeriodMax={deliveryCostData?.periodMax}
            appliedCode={appliedCode}
            promoInput={
              <CartSummaryPromoInput
                subtotal={subtotal}
                appliedCode={appliedCode}
                disabled={isSuccessStep}
              />
            }
          />
        </div>
      }
    />
  );
};
