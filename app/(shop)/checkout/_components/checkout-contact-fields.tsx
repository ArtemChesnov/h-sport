/**
 * Компонент полей контактов в checkout
 */

"use client";

import { FieldError } from "@/shared/components/common";
import { INPUT_FIELD_CLASS, INPUT_LABEL_CLASS } from "@/shared/constants";
import type { CheckoutAddressFormData } from "@/shared/hooks/checkout/checkout.hooks";

interface CheckoutContactFieldsProps {
  address: CheckoutAddressFormData;
  onAddressChange: (patch: Partial<CheckoutAddressFormData>) => void;
  errors?: {
    email?: string;
    phone?: string;
    fullName?: string;
  };
}

export function CheckoutContactFields({
  address,
  onAddressChange,
  errors,
}: CheckoutContactFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={INPUT_LABEL_CLASS}>
            E-mail <span className="text-destructive">*</span>
          </span>
          <input
            type="email"
            required
            className={INPUT_FIELD_CLASS}
            value={address.email}
            onChange={(e) => onAddressChange({ email: e.target.value })}
          />
          <FieldError message={errors?.email} />
        </label>

        <label className="space-y-2">
          <span className={INPUT_LABEL_CLASS}>
            Телефон <span className="text-destructive">*</span>
          </span>
          <input
            type="tel"
            required
            className={INPUT_FIELD_CLASS}
            placeholder="+7 999 999 99 99"
            value={address.phone}
            onChange={(e) => onAddressChange({ phone: e.target.value })}
          />
          <FieldError message={errors?.phone} />
        </label>
      </div>

      <label className="space-y-2">
        <span className={INPUT_LABEL_CLASS}>
          ФИО <span className="text-destructive">*</span>
        </span>
        <input
          type="text"
          required
          className={INPUT_FIELD_CLASS}
          value={address.fullName}
          onChange={(e) => onAddressChange({ fullName: e.target.value })}
        />
        <FieldError message={errors?.fullName} />
      </label>
    </div>
  );
}
