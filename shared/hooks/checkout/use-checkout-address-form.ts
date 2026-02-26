"use client";

import { TOAST } from "@/shared/constants";
import { CHECKOUT_VALIDATION } from "@/shared/constants";
import { getDeliveryMethodFlags } from "@/shared/lib/checkout";
import { isValidEmail } from "@/shared/lib/validation";
import type { CheckoutDeliveryMethod } from "@/shared/services/dto";
import React from "react";
import { toast } from "sonner";
import { useCheckoutAddress } from "./checkout.hooks";

export type CheckoutAddressFormErrors = Partial<{
  email: string;
  phone: string;
  fullName: string;
  country: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  pickupPoint: string;
}>;

/** Форма адреса чекаута: ошибки, валидация, смена способа доставки. */
export function useCheckoutAddressForm() {
  const { address, setAddress } = useCheckoutAddress();
  const [errors, setErrors] = React.useState<CheckoutAddressFormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDeliveryMethodChange = React.useCallback(
    (method: CheckoutDeliveryMethod) => {
      setAddress({ deliveryMethod: method });
      setErrors({});

      if (method === "CDEK_PVZ" || method === "POCHTA_PVZ") {
        setAddress({
          street: "",
          house: "",
          entrance: "",
          apartment: "",
          pickupPoint: "",
        });
      }

      if (method === "PICKUP_SHOWROOM") {
        setAddress({
          city: "",
          street: "",
          house: "",
          entrance: "",
          apartment: "",
          pickupPoint: "",
        });
      }
    },
    [setAddress]
  );

  const validateForm = React.useCallback((): boolean => {
    const newErrors: CheckoutAddressFormErrors = {};

    if (!address.email.trim()) {
      newErrors.email = CHECKOUT_VALIDATION.email.required;
    } else if (!isValidEmail(address.email)) {
      newErrors.email = CHECKOUT_VALIDATION.email.invalid;
    }

    if (!address.phone.trim()) {
      newErrors.phone = CHECKOUT_VALIDATION.phone.required;
    }

    if (!address.fullName.trim()) {
      newErrors.fullName = CHECKOUT_VALIDATION.fullName.required;
    }

    const { isPickup, isPvz } = getDeliveryMethodFlags(address.deliveryMethod);

    if (isPvz) {
      if (!address.city.trim()) {
        newErrors.city = CHECKOUT_VALIDATION.city.required;
      }
      if (!address.pickupPoint.trim()) {
        newErrors.pickupPoint = CHECKOUT_VALIDATION.pickupPoint.required;
      }
    }

    if (!isPickup && !isPvz) {
      if (!address.country.trim()) {
        newErrors.country = CHECKOUT_VALIDATION.country.required;
      }
      if (!address.city.trim()) {
        newErrors.city = CHECKOUT_VALIDATION.city.required;
      }
      if (!address.street.trim()) {
        newErrors.street = CHECKOUT_VALIDATION.street.required;
      }
      if (!address.house.trim()) {
        newErrors.house = CHECKOUT_VALIDATION.house.required;
      }
      if (!address.apartment.trim()) {
        newErrors.apartment = CHECKOUT_VALIDATION.apartment.required;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(TOAST.ERROR.FILL_REQUIRED);
      return false;
    }

    return true;
  }, [address]);

  return {
    address,
    setAddress,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    handleDeliveryMethodChange,
    validateForm,
  };
}
