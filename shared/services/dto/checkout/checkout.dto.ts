import type { DeliveryMethodDto } from "../base.dto";

/**
 * Способ доставки на стороне checkout-формы.
 * Алиас DeliveryMethodDto для согласованности с API.
 */
export type CheckoutDeliveryMethod = DeliveryMethodDto;

/** Форма адреса чекаута (поля + API-совместимость). */
export type CheckoutAddressFormData = {
  email: string;
  phone: string;
  fullName: string;

  country: string;
  city: string;
  street: string;
  house: string;
  entrance: string;
  apartment: string;

  pickupPoint: string;
  deliveryMethod: CheckoutDeliveryMethod;
};
