/**
 * Компонент полей адреса в checkout
 */

"use client";

import type { PickupPoint } from "@/modules/shipping/types/pickup-points";
import { AddressFields, FieldError } from "@/shared/components/common";
import { INPUT_LABEL_CLASS } from "@/shared/constants";
import { PICKUP_ADDRESS } from "@/shared/constants";
import type { CheckoutAddressFormData } from "@/shared/hooks/checkout/checkout.hooks";
import { getDeliveryMethodFlags } from "@/shared/lib/checkout";
import { PickupPointSelect } from "./pickup-point-select";

interface CheckoutAddressFieldsProps {
  address: CheckoutAddressFormData;
  onAddressChange: (patch: Partial<CheckoutAddressFormData>) => void;
  errors?: {
    country?: string;
    city?: string;
    street?: string;
    house?: string;
    apartment?: string;
    pickupPoint?: string;
  };
}

export function CheckoutAddressFields({
  address,
  onAddressChange,
  errors,
}: CheckoutAddressFieldsProps) {
  const { isPickup, isPvz, showStreetAndApartment } = getDeliveryMethodFlags(
    address.deliveryMethod
  );
  const showPvzInput = isPvz;

  return (
    <div className="space-y-4">
      {!isPickup && (
        <AddressFields
          values={{
            country: address.country,
            city: address.city,
            street: address.street,
            house: address.house,
            entrance: address.entrance,
            apartment: address.apartment,
          }}
          onChange={onAddressChange}
          errors={{
            country: errors?.country,
            city: errors?.city,
            street: errors?.street,
            house: errors?.house,
            apartment: errors?.apartment,
          }}
          showStreetBlock={showStreetAndApartment}
        />
      )}

      {showPvzInput && (
        <div className="space-y-2">
          <label className={INPUT_LABEL_CLASS}>
            Пункт выдачи <span className="text-destructive">*</span>
          </label>
          <PickupPointSelect
            provider={address.deliveryMethod === "CDEK_PVZ" ? "cdek" : "russianpost"}
            city={address.city}
            value={address.pickupPoint}
            onSelect={(point: PickupPoint) => {
              onAddressChange({
                street: `${point.name}, ${point.address}`,
                pickupPoint: point.id,
              });
            }}
          />
          <FieldError message={errors?.pickupPoint} />
        </div>
      )}

      {isPickup && (
        <div className="flex flex-col gap-3">
          <p className="text-[18px] text-muted-foreground">Самовывоз из шоурума:</p>
          <div className="flex flex-col gap-2">
            <p className="text-[18px] text-muted-foreground">📍 {PICKUP_ADDRESS.displayFull}</p>
            <p className="text-[18px] text-muted-foreground">🕒 {PICKUP_ADDRESS.hours}</p>
          </div>
        </div>
      )}
    </div>
  );
}
