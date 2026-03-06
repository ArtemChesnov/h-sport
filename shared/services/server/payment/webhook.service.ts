/** Webhook Robokassa: парсинг formData, проверка подписи, обновление платежа/заказа. */

import {
  createOrderEvent,
  findPaymentByOrderId,
  updateOrderOnPayment,
  updatePaymentStatus,
} from "@/modules/payment/lib/db";
import { checkPaymentSignature } from "@/modules/payment/lib/robokassa";
import { prisma } from "@/prisma/prisma-client";
import { logger } from "@/shared/lib/logger";
import { generateWebhookKey, tryProcessWebhook } from "@/shared/lib/webhook-protection";

/** Данные webhook от Robokassa */
export interface RobokassaWebhookData {
  InvId: string;
  OutSum: string;
  SignatureValue: string;
  Fee?: string;
  EMail?: string;
  PaymentMethod?: string;
  IncCurrLabel?: string;
  userParams: Record<string, string>;
}

/** Результат обработки webhook */
export type WebhookResult =
  | { ok: true; invId: string; replay?: true }
  | { ok: false; status: number; message: string };

/**
 * Парсит FormData из webhook
 */
export function parseWebhookFormData(body: FormData): RobokassaWebhookData | null {
  const InvId = body.get("InvId")?.toString();
  const OutSum = body.get("OutSum")?.toString();
  const SignatureValue = body.get("SignatureValue")?.toString();

  if (!InvId || !OutSum || !SignatureValue) {
    return null;
  }

  const userParams: Record<string, string> = {};
  for (const [key, value] of body.entries()) {
    if (key.startsWith("Shp_")) {
      userParams[key] = value.toString();
    }
  }

  return {
    InvId,
    OutSum,
    SignatureValue,
    Fee: body.get("Fee")?.toString(),
    EMail: body.get("EMail")?.toString(),
    PaymentMethod: body.get("PaymentMethod")?.toString(),
    IncCurrLabel: body.get("IncCurrLabel")?.toString(),
    userParams,
  };
}

/**
 * Обрабатывает webhook от Robokassa
 */
export async function processRobokassaWebhook(
  data: RobokassaWebhookData,
  baseUrl: string
): Promise<WebhookResult> {
  const { InvId, OutSum, SignatureValue, Fee, EMail, PaymentMethod, IncCurrLabel, userParams } =
    data;

  const orderId = parseInt(InvId, 10);
  if (isNaN(orderId)) {
    return { ok: false, status: 400, message: "Неверный ID заказа" };
  }

  // Replay protection: in-memory store (single instance)
  const webhookKey = generateWebhookKey("robokassa", InvId, SignatureValue);
  const canProcess = tryProcessWebhook(webhookKey);
  if (!canProcess) {
    logger.info("Webhook already processed (replay protection)", { InvId, webhookKey });
    return { ok: true, invId: InvId, replay: true }; // Уже обработан — OK
  }

  // Проверка подписи
  const isValid = checkPaymentSignature(
    { InvId, OutSum, SignatureValue, Fee, EMail, PaymentMethod, IncCurrLabel, Shp_: userParams },
    true
  );

  if (!isValid) {
    logger.warn("Invalid signature", { InvId, OutSum });
    return { ok: false, status: 400, message: "Неверная подпись" };
  }

  // Находим платеж
  const payment = await findPaymentByOrderId(orderId);
  if (!payment) {
    return { ok: false, status: 404, message: "Платеж не найден" };
  }

  // Обновляем платёж, заказ и создаём событие в одной транзакции
  const receiptUrl = `${baseUrl}/api/payment/receipt/${payment.id}`;
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        externalId: InvId,
        signature: SignatureValue,
        receiptUrl,
        updatedAt: new Date(),
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID", updatedAt: new Date() },
    });

    await tx.orderEvent.create({
      data: {
        orderId,
        type: "PAYMENT_PAID",
        payload: {
          paymentId: payment.id,
          amount: OutSum,
          timestamp: new Date().toISOString(),
        },
      },
    });
  });

  // Отправляем email (асинхронно, вне транзакции)
  sendOrderEmailAsync(orderId).catch((err) => {
    logger.error("Ошибка при отправке email о заказе", err);
  });

  return { ok: true, invId: InvId };
}

/**
 * Отправляет email о заказе (асинхронно)
 */
async function sendOrderEmailAsync(orderId: number): Promise<void> {
  const order = await prisma.order.findUnique({
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

  if (!order) return;

  const { sendOrderConfirmationEmailAsync } = await import("@/modules/auth/lib/email");
  sendOrderConfirmationEmailAsync(order.email, {
    id: order.id,
    uid: order.uid,
    total: order.total,
    totalItems: order.totalItems,
    items: order.items.map((item) => ({
      productName: item.productName,
      qty: item.qty,
      price: item.price,
      size: item.size,
      color: item.color,
    })),
    deliveryMethod: order.delivery?.method ?? null,
    deliveryAddress: order.delivery?.address ?? null,
    deliveryCity: order.delivery?.city ?? null,
    promoCode: order.promoCodeCode ?? null,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    subtotal: order.subtotal,
  });
}
