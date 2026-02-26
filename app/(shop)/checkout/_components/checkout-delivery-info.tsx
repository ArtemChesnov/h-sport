/**
 * Компонент отображения информации о доставке (только для чтения)
 */

"use client";

import { PICKUP_ADDRESS } from "@/shared/constants";
import type { CheckoutAddressFormData } from "@/shared/hooks/checkout/checkout.hooks";
import {
    buildFullAddressLine,
    getCheckoutDeliveryMethodLabel,
} from "@/shared/hooks/checkout/checkout.hooks";
import { getDeliveryMethodFlags } from "@/shared/lib/checkout";

interface CheckoutDeliveryInfoProps {
  address: CheckoutAddressFormData;
}

export function CheckoutDeliveryInfo({ address }: CheckoutDeliveryInfoProps) {
  const { isPickup, isPvz, showStreetAndApartment } = getDeliveryMethodFlags(
    address.deliveryMethod
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
          Способ доставки
        </span>
        <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">{getCheckoutDeliveryMethodLabel(address.deliveryMethod)}</p>
      </div>

      {!isPickup && (
        <>
          {address.country && (
            <div className="space-y-2">
              <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
                Страна
              </span>
              <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">{address.country}</p>
            </div>
          )}

          {address.city && (
            <div className="space-y-2">
              <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
                Город
              </span>
              <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">{address.city}</p>
            </div>
          )}

          {showStreetAndApartment && address.street && (
            <div className="space-y-2">
              <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
                Адрес
              </span>
              <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">
                {buildFullAddressLine({
                  street: address.street,
                  house: address.house,
                  entrance: address.entrance,
                  apartment: address.apartment,
                })}
              </p>
            </div>
          )}

          {isPvz && address.street && (
            <div className="space-y-2">
              <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
                Пункт выдачи
              </span>
              <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">{address.street}</p>
            </div>
          )}
        </>
      )}

      {isPickup && (
        <div className="space-y-2">
          <span className="block text-[14px] uppercase tracking-[0.08em] text-muted-foreground">
            Адрес самовывоза
          </span>
          <p className="text-[16px] max-[576px]:text-[14px] leading-[130%]">
            {PICKUP_ADDRESS.displayShort}
            <br />
            <span className="text-muted-foreground">{PICKUP_ADDRESS.hours}</span>
          </p>
        </div>
      )}
    </div>
  );
}
