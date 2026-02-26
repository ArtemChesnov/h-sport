/**
 * Компонент выбора способа доставки
 */

"use client";

import { RadioOption } from "@/shared/components/ui/radio-option";
import type { CheckoutDeliveryMethod } from "@/shared/hooks/checkout/checkout.hooks";
import { getCheckoutDeliveryMethodLabel } from "@/shared/hooks/checkout/checkout.hooks";

const DELIVERY_METHODS: CheckoutDeliveryMethod[] = [
  "CDEK_COURIER",
  "CDEK_PVZ",
  "POCHTA_COURIER",
  "POCHTA_PVZ",
  "PICKUP_SHOWROOM",
];

interface CheckoutDeliveryMethodSelectorProps {
  value: CheckoutDeliveryMethod;
  onChange: (method: CheckoutDeliveryMethod) => void;
}

export function CheckoutDeliveryMethodSelector({
  value,
  onChange,
}: CheckoutDeliveryMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="text-[16px] max-[1440px]:text-[14px] leading-[130%] uppercase text-muted-foreground">
        Способ доставки
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {DELIVERY_METHODS.map((method) => (
          <div
            key={method}
            className="flex cursor-pointer items-center gap-2.5 rounded-[10px] border border-border/60 px-3 py-4 text-[16px] max-[1440px]:text-[14px] leading-[130%] group"
          >
            <RadioOption
              name="deliveryMethod"
              value={method}
              label={getCheckoutDeliveryMethodLabel(method)}
              checked={value === method}
              onChange={() => onChange(method)}
              className="flex-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
