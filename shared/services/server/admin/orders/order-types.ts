/**
 * Типы для админских заказов (server)
 */

import type { Prisma, DeliveryMethod } from "@prisma/client";

export type OrderWithRelations = Prisma.OrderGetPayload<{
  select: {
    id: true;
    uid: true;
    status: true;
    email: true;
    phone: true;
    fullName: true;
    totalItems: true;
    subtotal: true;
    discount: true;
    deliveryFee: true;
    total: true;
    promoCodeCode: true;
    createdAt: true;
    delivery: {
      select: {
        method: true;
        city: true;
        address: true;
        trackingCode: true;
        price: true;
      };
    };
    items: {
      select: {
        productId: true;
        productName: true;
        sku: true;
        color: true;
        size: true;
        qty: true;
        price: true;
        total: true;
        productImageUrl: true;
      };
    };
    payments: {
      select: {
        id: true;
        amount: true;
        currency: true;
        status: true;
        method: true;
        receiptUrl: true;
        createdAt: true;
      };
    };
  };
}>;

export type OrderUpdateData = Prisma.OrderUpdateInput;

export type DeliveryPatch = {
  method?: DeliveryMethod;
  city?: string | null;
  address?: string | null;
  trackingCode?: string | null;
};

export const ORDER_SELECT = {
  id: true,
  uid: true,
  status: true,
  email: true,
  phone: true,
  fullName: true,
  totalItems: true,
  subtotal: true,
  discount: true,
  deliveryFee: true,
  total: true,
  promoCodeCode: true,
  createdAt: true,
  delivery: {
    select: {
      method: true,
      city: true,
      address: true,
      trackingCode: true,
      price: true,
    },
  },
  items: {
    select: {
      productId: true,
      productName: true,
      sku: true,
      color: true,
      size: true,
      qty: true,
      price: true,
      total: true,
      productImageUrl: true,
    },
  },
  payments: {
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      method: true,
      receiptUrl: true,
      createdAt: true,
    },
  },
} as const;
