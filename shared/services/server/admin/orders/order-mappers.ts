/**
 * Мапперы заказов в DTO (admin)
 */

import type * as DTO from "@/shared/services/dto";
import type { OrderWithRelations } from "./order-types";

export function mapOrderToDetailDto(order: OrderWithRelations): DTO.OrderDetailDto {
  return {
    id: order.id,
    uid: order.uid,
    status: order.status as DTO.OrderStatusDto,
    email: order.email,
    phone: order.phone,
    fullName: order.fullName,
    totalItems: order.totalItems,
    subtotal: order.subtotal,
    discount: order.discount ?? 0,
    deliveryFee: order.deliveryFee,
    total: order.total,
    promoCode: order.promoCodeCode ?? null,
    createdAt: order.createdAt.toISOString(),
    delivery: order.delivery
      ? {
          method: order.delivery.method as DTO.DeliveryMethodDto,
          city: order.delivery.city,
          address: order.delivery.address,
          trackingCode: order.delivery.trackingCode,
          price: order.delivery.price,
        }
      : null,
    items: order.items.map(
      (item): DTO.OrderItemDto => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        color: item.color,
        size: item.size,
        qty: item.qty,
        price: item.price,
        total: item.total,
        productImageUrl: item.productImageUrl,
      })
    ),
    payments: order.payments.map(
      (payment): DTO.OrderPaymentDto => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status as DTO.PaymentStatusDto,
        method: payment.method,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt.toISOString(),
      })
    ),
  };
}
