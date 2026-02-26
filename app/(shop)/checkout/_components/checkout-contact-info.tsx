/**
 * Компонент отображения контактных данных (только для чтения)
 */

"use client";

import type { CheckoutAddressFormData } from "@/shared/hooks/checkout/checkout.hooks";

interface CheckoutContactInfoProps {
  address: CheckoutAddressFormData;
}

export function CheckoutContactInfo({ address }: CheckoutContactInfoProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-1">
      <div className="space-y-2">
        <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
          E-mail
        </span>
        <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">{address.email || "—"}</p>
      </div>

      <div className="space-y-2">
        <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
          Телефон
        </span>
        <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">{address.phone || "—"}</p>
      </div>

      <div className="space-y-2">
        <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
          ФИО
        </span>
        <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">{address.fullName || "—"}</p>
      </div>
    </div>
  );
}
