/**
 * Интеграция с Robokassa
 */

import { createHash } from "crypto";
import { env } from "@/shared/lib/config/env";
import { Robokassa } from "@dev-aces/robokassa";
import type { PaymentConfig, PaymentRequest, PaymentUrlResponse, ReceiptItem } from "../types";

let robokassaInstance: Robokassa | null = null;

/**
 * Инициализирует экземпляр Robokassa
 */
export function initRobokassa(config: PaymentConfig): Robokassa {
  robokassaInstance = new Robokassa({
    merchantLogin: config.merchantLogin,
    password1: config.password1,
    password2: config.password2,
    isTest: config.isTest ?? false,
    hashAlgorithm: config.hashAlgorithm ?? "md5",
    url: config.url,
  });

  return robokassaInstance;
}

/**
 * Получает конфигурацию из переменных окружения
 */
export function getRobokassaConfig(): PaymentConfig | null {
  const merchantLogin = env.ROBOKASSA_MERCHANT_LOGIN;
  const password1 = env.ROBOKASSA_PASSWORD_1;
  const password2 = env.ROBOKASSA_PASSWORD_2;

  if (!merchantLogin || !password1 || !password2) {
    return null;
  }

  return {
    merchantLogin,
    password1,
    password2,
    isTest: env.ROBOKASSA_IS_TEST ?? false,
    hashAlgorithm: env.ROBOKASSA_HASH_ALGORITHM ?? "md5",
  };
}

/**
 * Получает или создаёт экземпляр Robokassa
 */
export function getRobokassa(): Robokassa {
  if (robokassaInstance) {
    return robokassaInstance;
  }

  const config = getRobokassaConfig();
  if (!config) {
    throw new Error("Robokassa configuration not found. Please set environment variables.");
  }

  return initRobokassa(config);
}

/**
 * Генерирует URL для оплаты
 */
export async function generatePaymentUrl(request: PaymentRequest): Promise<PaymentUrlResponse> {
  const robokassa = getRobokassa();

  const outSum = (request.amount / 100).toFixed(2);
  const outSumNumber = request.amount / 100;

  const receiptItems: ReceiptItem[] =
    request.receiptItems && request.receiptItems.length > 0
      ? request.receiptItems
      : [
          {
            sum: outSumNumber,
            name: request.description.slice(0, 128),
            quantity: 1,
            payment_method: "full_payment",
            payment_object: "commodity",
            tax: "none",
          },
        ];

  const url = robokassa.generatePaymentUrl({
    outSum,
    description: request.description,
    invId: typeof request.orderId === "number" ? request.orderId : Number(request.orderId),
    userParameters: request.userParameters,
    receipt: {
      items: receiptItems,
    },
  });

  return { url };
}

/**
 * Формирует массив позиций фискального чека из данных заказа.
 * Цены в БД хранятся в копейках — конвертируем в рубли.
 */
export function buildReceiptItems(
  items: { productName: string; qty: number; price: number }[],
  deliveryFee: number
): ReceiptItem[] {
  const receiptItems: ReceiptItem[] = items.map((item) => ({
    name: item.productName.slice(0, 128),
    quantity: item.qty,
    sum: (item.price * item.qty) / 100,
    payment_method: "full_payment" as const,
    payment_object: "commodity" as const,
    tax: "none" as const,
  }));

  if (deliveryFee > 0) {
    receiptItems.push({
      name: "Доставка",
      quantity: 1,
      sum: deliveryFee / 100,
      payment_method: "full_payment",
      payment_object: "service",
      tax: "none",
    });
  }

  return receiptItems;
}

/**
 * Проверяет подпись от Robokassa
 */
export function checkPaymentSignature(
  data: {
    InvId: string;
    OutSum: string;
    SignatureValue: string;
    Fee?: string;
    EMail?: string;
    PaymentMethod?: string;
    IncCurrLabel?: string;
    Shp_?: Record<string, string>;
  },
  _isResultUrl: boolean = false
): boolean {
  const robokassa = getRobokassa();

  const response = {
    InvId: Number(data.InvId),
    OutSum: data.OutSum,
    SignatureValue: data.SignatureValue,
    Fee: data.Fee || "0.00",
    PaymentMethod: data.PaymentMethod || "unknown",
    IncCurrLabel: data.IncCurrLabel || "RUR",
    ...(data.EMail && { EMail: data.EMail }),
    ...(data.Shp_ || {}),
  };

  return robokassa.checkPayment(response as Parameters<typeof robokassa.checkPayment>[0]);
}

/**
 * Проверяет подпись SuccessURL (формула: OutSum:InvId:Пароль#1:Shp_*)
 * Отличается от ResultURL тем, что Robokassa подписывает password1, а не password2.
 */
export function checkSuccessSignature(data: {
  InvId: string;
  OutSum: string;
  SignatureValue: string;
  Shp_?: Record<string, string>;
}): boolean {
  const config = getRobokassaConfig();
  if (!config) return false;

  const shpParams = Object.entries(data.Shp_ || {})
    .map(([key, value]) => `${key}=${value}`)
    .sort((a, b) => a.localeCompare(b));

  const signatureString = [data.OutSum, data.InvId, config.password1, ...shpParams].join(":");
  const algorithm = config.hashAlgorithm ?? "md5";
  const expectedHash = createHash(algorithm).update(signatureString).digest("hex");

  return expectedHash.toLowerCase() === data.SignatureValue.toLowerCase();
}
