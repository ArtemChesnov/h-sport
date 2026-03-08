/**
 * Server service: receipt data for payment receipt (HTML/PDF).
 */

import { prisma } from "@/prisma/prisma-client";

export type ReceiptOrderItem = {
  productName: string;
  size: string | null;
  color: string | null;
  qty: number;
  price: number;
  total: number;
};

export type ReceiptOrder = {
  id: number;
  userId: string | null;
  email: string;
  fullName: string | null;
  subtotal: number | null;
  discount: number;
  deliveryFee: number;
  total: number;
  promoCodeCode: string | null;
  items: ReceiptOrderItem[];
};

export type ReceiptData = {
  payment: {
    id: number;
    updatedAt: Date;
    externalId: string | null;
  };
  order: ReceiptOrder;
};

/**
 * Returns payment with order (items, delivery) for receipt generation, or null if not found.
 */
export async function getReceiptById(paymentId: number): Promise<ReceiptData | null> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          items: true,
          delivery: true,
        },
      },
    },
  });

  if (!payment || !payment.order) return null;

  return {
    payment: {
      id: payment.id,
      updatedAt: payment.updatedAt,
      externalId: payment.externalId,
    },
    order: {
      id: payment.order.id,
      userId: payment.order.userId,
      email: payment.order.email,
      fullName: payment.order.fullName,
      subtotal: payment.order.subtotal,
      discount: payment.order.discount,
      deliveryFee: payment.order.deliveryFee,
      total: payment.order.total,
      promoCodeCode: payment.order.promoCodeCode,
      items: payment.order.items.map((item) => ({
        productName: item.productName,
        size: item.size,
        color: item.color,
        qty: item.qty,
        price: item.price,
        total: item.total,
      })),
    },
  };
}
