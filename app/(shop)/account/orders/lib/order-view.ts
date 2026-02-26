/**
 * Re-export из shared для ЛК.
 */
export { formatRelativeDate } from "@/shared/lib/formatters/date";
export {
    getDeliveryMethodLabel, getOrderStatusInfo, getOrderStatusLabel
} from "@/shared/lib/styles";

import { getDeliveryMethodLabel, getOrderStatusLabel } from "@/shared/lib/styles";

/** Алиас для совместимости с account/orders/[uid] */
export function formatOrderStatus(status: Parameters<typeof getOrderStatusLabel>[0]) {
  return getOrderStatusLabel(status);
}

/** Алиас для совместимости с account/orders/[uid] */
export function formatDeliveryMethod(
  method: Parameters<typeof getDeliveryMethodLabel>[0],
) {
  return getDeliveryMethodLabel(method);
}
