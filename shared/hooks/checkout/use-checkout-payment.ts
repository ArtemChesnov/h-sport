"use client";

import { PICKUP_ADDRESS, type CheckoutPaymentMethod } from "@/shared/constants";
import { getDeliveryMethodFlags } from "@/shared/lib/checkout";
import { getCsrfToken } from "@/shared/lib/csrf-client";
import type { CheckoutAddressFormData } from "@/shared/services/dto";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { useCreateOrderMutation } from "../orders/orders.hooks";
import {
  buildFullAddressLine,
  CHECKOUT_ADDRESS_STORAGE_KEY,
  loadCheckoutAddressFromStorage,
} from "./checkout.hooks";

/** Страница оплаты: адрес из storage, создание заказа/платежа, редирект. */
export function useCheckoutPayment() {
  const router = useRouter();
  const createOrderMutation = useCreateOrderMutation();

  const [address, setAddress] = React.useState<CheckoutAddressFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<CheckoutPaymentMethod>("CARD");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const stored = loadCheckoutAddressFromStorage();
    if (!stored) {
      router.replace("/checkout");
      return;
    }
    setAddress(stored);
    setIsLoading(false);
  }, [router]);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!address || isSubmitting || createOrderMutation.isPending) return;

      setIsSubmitting(true);

      const email = address.email.trim();
      const phone = address.phone.trim() || null;
      const fullName = address.fullName.trim() || null;
      const { isPickup } = getDeliveryMethodFlags(address.deliveryMethod);

      let cityValue: string | null = null;
      let addressLine: string | null = null;

      if (isPickup) {
        cityValue = PICKUP_ADDRESS.city;
        addressLine = PICKUP_ADDRESS.addressLine;
      } else {
        addressLine =
          buildFullAddressLine({
            street: address.street,
            house: address.house,
            entrance: address.entrance,
            apartment: address.apartment,
          }) || null;
        cityValue = address.city.trim() || null;
      }

      try {
        const order = await createOrderMutation.mutateAsync({
          email,
          phone,
          fullName,
          delivery: {
            method: address.deliveryMethod,
            city: cityValue,
            address: addressLine,
          },
        });

        const csrfToken = getCsrfToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
        }

        const paymentResponse = await fetch("/api/payment/create", {
          method: "POST",
          headers,
          body: JSON.stringify({
            orderId: order.id,
            amount: order.total,
            description: `Заказ №${order.id}`,
            email,
            userParameters: {
              Shp_payment_method: paymentMethod,
            },
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          throw new Error(errorData.message || "Ошибка при создании платежа");
        }

        const { url } = await paymentResponse.json();

        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem(CHECKOUT_ADDRESS_STORAGE_KEY);
        }

        window.location.href = url;
      } catch (error) {
        setIsSubmitting(false);
        const errorMessage =
          error instanceof Error ? error.message : "Произошла ошибка при создании заказа";
        toast.error(errorMessage);
      }
    },
    [address, paymentMethod, isSubmitting, createOrderMutation]
  );

  return {
    address,
    paymentMethod,
    setPaymentMethod,
    isSubmitting,
    isLoading,
    createOrderMutation,
    handleSubmit,
  };
}
