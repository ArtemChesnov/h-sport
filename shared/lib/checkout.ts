import type { DeliveryMethodDto } from "@/shared/services/dto";

export type { DeliveryMethodDto };

/**
 * Флаги способа доставки для чекаута.
 * Используется в checkout-page-client, checkout-address-fields,
 * checkout-delivery-info, checkout-summary-card, payment/page.
 */
export function getDeliveryMethodFlags(method: DeliveryMethodDto) {
  const isPickup = method === "PICKUP_SHOWROOM";
  const isPvz = method === "CDEK_PVZ" || method === "POCHTA_PVZ";
  const showStreetAndApartment = !isPvz && !isPickup;

  return {
    isPickup,
    isPvz,
    showStreetAndApartment,
  };
}
