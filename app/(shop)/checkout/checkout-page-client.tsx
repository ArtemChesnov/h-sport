"use client";

import { CheckoutErrorBoundary } from "@/shared/components/error-boundaries";
import { DesignButton } from "@/shared/components/ui/design-button";
import { CHECKOUT_LABELS, SECTION_HEADING_CLASS } from "@/shared/constants";
import { useCartQuery, useCheckoutAddressForm, usePaymentErrorFromUrl } from "@/shared/hooks";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { CheckoutAddressFields } from "./_components/checkout-address-fields";
import { CheckoutContactFields } from "./_components/checkout-contact-fields";
import { CheckoutDeliveryMethodSelector } from "./_components/checkout-delivery-method-selector";
import { CheckoutPageSkeleton } from "./_components/checkout-skeletons";

export default function CheckoutPageClient() {
  const router = useRouter();
  const {
    address,
    setAddress,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleDeliveryMethodChange,
    validateForm,
  } = useCheckoutAddressForm();
  const { isLoading: isCartLoading } = useCartQuery();

  usePaymentErrorFromUrl();

  if (isCartLoading) {
    return <CheckoutPageSkeleton />;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;
    setIsSubmitting(true);
    router.push("/checkout/payment");
  }

  return (
    <CheckoutErrorBoundary>
      <section className="flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className={`${SECTION_HEADING_CLASS} mb-6`}>
            Адрес доставки:
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 ">
          <CheckoutContactFields address={address} onAddressChange={setAddress} errors={errors} />

          <CheckoutDeliveryMethodSelector
            value={address.deliveryMethod}
            onChange={handleDeliveryMethodChange}
          />

          <CheckoutAddressFields address={address} onAddressChange={setAddress} errors={errors} />
          {/* При 1600px и ниже кнопка той же ширины, что и инпут Улица (на 768–1600px — ширина одной колонки адреса) */}
          <div className="pt-4 w-full max-[1600px]:md:max-w-[calc((100%-1.25rem)/2)]">
            <DesignButton
              type="submit"
              disabled={isSubmitting}
              variant="default"
              className="w-full h-14 rounded-[10px] border-0 text-base"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : CHECKOUT_LABELS.continue}
            </DesignButton>
          </div>
        </form>
      </section>
    </CheckoutErrorBoundary>
  );
}
