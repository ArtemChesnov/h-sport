import type { DTO } from "@/shared/services";

// Какие статусы показываем в фильтре/селекте админки
export const ADMIN_ORDER_STATUS_FILTER_VALUES: DTO.OrderStatusDto[] = [
  "NEW",
  "PROCESSING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELED",
];

/** Re-export из единого источника */
export { getOrderStatusLabel } from "@/shared/lib/styles";

// Варианты доставки, которые доступны в админке
export const DELIVERY_METHODS: DTO.DeliveryMethodDto[] = [
  "CDEK_PVZ",
  "CDEK_COURIER",
  "POCHTA_PVZ",
  "POCHTA_COURIER",
  "PICKUP_SHOWROOM",
];

// Человеческие подписи способов доставки
export const DELIVERY_METHOD_LABELS: Record<DTO.DeliveryMethodDto, string> = {
  CDEK_PVZ: "СДЭК, ПВЗ",
  CDEK_COURIER: "СДЭК, курьер",
  POCHTA_PVZ: "Почта России, ПВЗ",
  POCHTA_COURIER: "Почта России, курьер",
  PICKUP_SHOWROOM: "Самовывоз из шоурума",
};

export function getDeliveryMethodLabel(
  method: DTO.DeliveryMethodDto | null | undefined,
): string {
  if (!method) return "— не задан —";
  return DELIVERY_METHOD_LABELS[method] ?? method;
}
