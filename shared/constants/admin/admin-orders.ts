import {
  DELIVERY_METHOD_LABELS,
  ORDER_STATUS_LABELS_FORM,
} from "@/shared/lib/styles";
import type { DeliveryMethodDto, OrderStatusDto } from "@/shared/services/dto";

/**
 * Опции статусов заказа для админки.
 * Генерируются из единого источника ORDER_STATUS_LABELS_FORM.
 */
export const ADMIN_ORDER_STATUS_OPTIONS: {
  value: OrderStatusDto;
  label: string;
}[] = (Object.entries(ORDER_STATUS_LABELS_FORM) as [OrderStatusDto, string][]).map(
  ([value, label]) => ({ value, label }),
);

/**
 * Опции способов доставки для админки.
 * Генерируются из единого источника DELIVERY_METHOD_LABELS.
 */
export const ADMIN_ORDER_DELIVERY_METHOD_OPTIONS: {
  value: DeliveryMethodDto;
  label: string;
}[] = (Object.entries(DELIVERY_METHOD_LABELS) as [DeliveryMethodDto, string][]).map(
  ([value, label]) => ({ value, label }),
);
