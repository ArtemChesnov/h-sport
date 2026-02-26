/**
 * Утилиты для работы с БД в модуле оплаты
 */

import { prisma } from "@/prisma/prisma-client";
import type { PaymentStatusDto } from "@/shared/services/dto";
import { PaymentProvider, PaymentMethod } from "@prisma/client";

/**
 * Создаёт запись о платеже (с retry для надежности)
 */
export async function createPayment(
  orderId: number,
  amount: number,
  method: PaymentMethod = "AUTO",
): Promise<number> {
  const { retryWithBackoff } = await import("@/shared/lib/retry");

  return retryWithBackoff(
    async () => {
      const payment = await prisma.payment.create({
        data: {
          orderId,
          provider: PaymentProvider.ROBOKASSA,
          method,
          amount,
          currency: "RUB",
          status: "PENDING",
        },
      });

      return payment.id;
    },
    {
      maxRetries: 3,
      initialDelay: 500,
      maxDelay: 5000,
    },
  );
}

/**
 * Обновляет статус платежа
 */
export async function updatePaymentStatus(
  paymentId: number,
  status: PaymentStatusDto,
  externalId?: string,
  signature?: string,
  receiptUrl?: string,
): Promise<void> {
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      externalId,
      signature,
      receiptUrl,
      updatedAt: new Date(),
    },
  });
}

/**
 * Находит платеж по ID заказа
 */
export async function findPaymentByOrderId(orderId: number) {
  return prisma.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Обновляет статус заказа при успешной оплате
 */
export async function updateOrderOnPayment(
  orderId: number,
  status: "PAID" | "PENDING_PAYMENT",
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status === "PAID" ? "PAID" : "PENDING_PAYMENT",
      updatedAt: new Date(),
    },
  });
}

/**
 * Создаёт событие заказа
 */
export async function createOrderEvent(
  orderId: number,
  type: string,
  payload?: Record<string, unknown>,
): Promise<void> {
  await prisma.orderEvent.create({
    data: {
      orderId,
      type,
      payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
    },
  });
}
