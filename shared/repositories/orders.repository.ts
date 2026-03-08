/**
 * Репозиторий для работы с заказами
 *
 * Инкапсулирует Prisma-запросы, без бизнес-логики.
 */

import { prisma } from "@/prisma/prisma-client";
import type { Order, OrderStatus, Prisma } from "@prisma/client";

/** Коды Prisma при обрыве соединения с БД — при них повторяем запрос один раз */
const CONNECTION_ERROR_CODES = new Set(["P1017", "P1001", "P1002"]);

function withConnectionRetry<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((e: unknown) => {
    const err = e as { code?: string };
    if (err?.code && CONNECTION_ERROR_CODES.has(err.code)) {
      return fn();
    }
    throw e;
  });
}

/**
 * Тип для короткого списка заказов (для ЛК)
 */
export type OrderShortSelectResult = {
  id: number;
  uid: string;
  status: OrderStatus;
  createdAt: Date;
  total: number;
  totalItems: number;
  delivery: {
    method: string;
    city: string | null;
    address: string | null;
    trackingCode: string | null;
  } | null;
  items: {
    productName: string;
    productImageUrl: string | null;
  }[];
};

/**
 * Тип для детального заказа
 */
export type OrderDetailSelectResult = {
  id: number;
  uid: string;
  status: OrderStatus;
  createdAt: Date;
  total: number;
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  email: string;
  phone: string | null;
  fullName: string | null;
  promoCodeCode: string | null;
  delivery: {
    method: string;
    city: string | null;
    address: string | null;
    trackingCode: string | null;
  } | null;
  items: {
    id: number;
    productId: number;
    productName: string;
    productImageUrl: string | null;
    sku: string | null;
    color: string | null;
    size: string | null;
    qty: number;
    price: number;
    total: number;
  }[];
};

export class OrdersRepository {
  /**
   * Получает список заказов пользователя (короткий формат для ЛК).
   * @param userId - ID пользователя
   * @param page - номер страницы (1-based)
   * @param perPage - элементов на страницу (по умолчанию 10)
   */
  static async findByUserId(
    userId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<{ orders: OrderShortSelectResult[]; total: number }> {
    const skip = Math.max(0, (page - 1) * perPage);

    const [orders, total] = await withConnectionRetry(() =>
      Promise.all([
        prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: perPage,
          select: {
            id: true,
            uid: true,
            status: true,
            createdAt: true,
            total: true,
            totalItems: true,
            delivery: {
              select: {
                method: true,
                city: true,
                address: true,
                trackingCode: true,
              },
            },
            items: {
              select: {
                productName: true,
                productImageUrl: true,
              },
              take: 3,
            },
          },
        }),
        prisma.order.count({ where: { userId } }),
      ])
    );

    return { orders, total };
  }

  /**
   * Получает детальную информацию о заказе по uid
   */
  static async findByUid(uid: string, userId?: string): Promise<OrderDetailSelectResult | null> {
    const where: Prisma.OrderWhereInput = { uid };
    if (userId) {
      where.userId = userId;
    }

    return prisma.order.findFirst({
      where,
      select: {
        id: true,
        uid: true,
        status: true,
        createdAt: true,
        total: true,
        totalItems: true,
        subtotal: true,
        discount: true,
        deliveryFee: true,
        email: true,
        phone: true,
        fullName: true,
        promoCodeCode: true,
        delivery: {
          select: {
            method: true,
            city: true,
            address: true,
            trackingCode: true,
          },
        },
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            productImageUrl: true,
            sku: true,
            color: true,
            size: true,
            qty: true,
            price: true,
            total: true,
          },
        },
      },
    });
  }

  /**
   * Проверяет существование заказа по idempotency key (uid)
   */
  static async findByIdempotencyKey(idempotencyKey: string): Promise<{
    id: number;
    uid: string;
    status: OrderStatus;
    total: number;
    totalItems: number;
    createdAt: Date;
  } | null> {
    return prisma.order.findFirst({
      where: { uid: idempotencyKey },
      select: {
        id: true,
        uid: true,
        status: true,
        total: true,
        totalItems: true,
        createdAt: true,
      },
    });
  }

  /**
   * Находит заказ пользователя с минимальным набором полей для отмены.
   */
  static async findForCancel(
    uid: string,
    userId: string
  ): Promise<{
    id: number;
    uid: string;
    status: OrderStatus;
  } | null> {
    return prisma.order.findFirst({
      where: { uid, userId },
      select: { id: true, uid: true, status: true },
    });
  }

  /**
   * Находит заказ пользователя с позициями для создания платежа и фискального чека.
   */
  static async findForPayment(
    uid: string,
    userId: string
  ): Promise<{
    id: number;
    status: OrderStatus;
    total: number;
    email: string;
    deliveryFee: number;
    items: { productName: string; qty: number; price: number }[];
  } | null> {
    return prisma.order.findFirst({
      where: { uid, userId },
      select: {
        id: true,
        status: true,
        total: true,
        email: true,
        deliveryFee: true,
        items: { select: { productName: true, qty: true, price: true } },
      },
    });
  }

  /**
   * Обновляет статус заказа
   */
  static async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  /**
   * Находит заказ по ID с позициями для создания платежа и фискального чека.
   */
  static async findForPaymentCreate(orderId: number): Promise<{
    id: number;
    status: OrderStatus;
    total: number;
    deliveryFee: number;
    items: { productName: string; qty: number; price: number }[];
  } | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        total: true,
        deliveryFee: true,
        items: { select: { productName: true, qty: true, price: true } },
      },
    });
  }

  /**
   * Получает заказ для отправки email (с items и delivery)
   */
  static async findForEmail(orderId: number): Promise<{
    id: number;
    uid: string;
    email: string;
    total: number;
    totalItems: number;
    discount: number;
    deliveryFee: number;
    subtotal: number;
    promoCodeCode: string | null;
    items: {
      productName: string;
      qty: number;
      price: number;
      size: string | null;
      color: string | null;
    }[];
    delivery: {
      method: string;
      address: string | null;
      city: string | null;
    } | null;
  } | null> {
    return prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        uid: true,
        email: true,
        total: true,
        totalItems: true,
        discount: true,
        deliveryFee: true,
        subtotal: true,
        promoCodeCode: true,
        items: {
          select: {
            productName: true,
            qty: true,
            price: true,
            size: true,
            color: true,
          },
        },
        delivery: {
          select: {
            method: true,
            address: true,
            city: true,
          },
        },
      },
    });
  }
}
