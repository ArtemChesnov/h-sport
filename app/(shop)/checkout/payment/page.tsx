"use client";

import { DesignButton } from "@/shared/components/ui/design-button";
import { SECTION_HEADING_CLASS } from "@/shared/constants";
import { useCartQuery, useCheckoutPayment } from "@/shared/hooks";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CheckoutContactInfo } from "../_components/checkout-contact-info";
import { CheckoutDeliveryInfo } from "../_components/checkout-delivery-info";
import { CheckoutPaymentMethodSelector } from "../_components/checkout-payment-method-selector";
import { CheckoutPaymentPageSkeleton } from "../_components/checkout-skeletons";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { data: cart } = useCartQuery();
  const {
    address,
    paymentMethod,
    setPaymentMethod,
    isSubmitting,
    isLoading,
    createOrderMutation,
    handleSubmit,
  } = useCheckoutPayment();

  if (isLoading || !address || !cart) {
    return <CheckoutPaymentPageSkeleton />;
  }

  return (
    <section className="text-[14px] w-full max-[1280px]:max-w-[890px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-10 w-full">
        {/* При <1280px: три блока в строку; при ≤768px снова в столбик */}
        <div className="flex flex-col gap-10 max-[1280px]:flex-row max-[1280px]:gap-6 max-[1280px]:w-full max-[768px]:flex-col">
          <div className="flex flex-col gap-6 max-[1280px]:flex-1 max-[1280px]:min-w-0 max-[768px]:flex-initial">
            <div className="flex items-center justify-between">
              <h2 className={SECTION_HEADING_CLASS}>Контактные данные:</h2>
            </div>
            <CheckoutContactInfo address={address} />
          </div>
          <div className="flex flex-col gap-6 max-[1280px]:flex-1 max-[1280px]:min-w-0 max-[768px]:flex-initial">
            <div className="flex items-center justify-between">
              <h2 className={SECTION_HEADING_CLASS}>Доставка:</h2>
            </div>
            <CheckoutDeliveryInfo address={address} />
          </div>
          <div className="flex flex-col gap-6 max-[1280px]:flex-1 max-[1280px]:min-w-0 max-[768px]:flex-initial">
            <h2 className={SECTION_HEADING_CLASS}>Способ оплаты:</h2>
            <CheckoutPaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-0 w-full max-w-[890px]">
          <DesignButton
            type="button"
            variant="outline"
            onClick={() => router.push("/checkout")}
            className="flex-1 h-14 rounded-[10px] border-neutral-300 text-base min-w-0"
          >
            Вернуться к адресу доставки
          </DesignButton>
          <DesignButton
            type="submit"
            disabled={isSubmitting || createOrderMutation.isPending}
            variant="default"
            className="flex-1 h-14 rounded-[10px] border-0 text-base min-w-0"
          >
            {isSubmitting || createOrderMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Перейти к оплате"
            )}
          </DesignButton>
        </div>
      </form>
    </section>
  );
}
