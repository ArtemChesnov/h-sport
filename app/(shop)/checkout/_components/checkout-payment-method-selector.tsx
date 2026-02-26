"use client";

import { RadioOption } from "@/shared/components/ui/radio-option";
import type { CheckoutPaymentMethod } from "@/shared/constants";
import { CHECKOUT_PAYMENT_METHODS } from "@/shared/constants";

interface CheckoutPaymentMethodSelectorProps {
  value: CheckoutPaymentMethod;
  onChange: (method: CheckoutPaymentMethod) => void;
}

/** Единый размер текста значений на странице оплаты: макс. 16px, адаптив */
const PAYMENT_PAGE_VALUE_CLASS = "text-[16px] max-[576px]:text-[14px] leading-[130%]";

export function CheckoutPaymentMethodSelector({
  value,
  onChange,
}: CheckoutPaymentMethodSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      {CHECKOUT_PAYMENT_METHODS.map((option) => (
        <RadioOption
          key={option.value}
          name="payment"
          value={option.value}
          label={option.label}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className={PAYMENT_PAGE_VALUE_CLASS}
        />
      ))}
    </div>
  );
}
