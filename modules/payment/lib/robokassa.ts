/**
 * Интеграция с Robokassa
 */

import { Robokassa } from "@dev-aces/robokassa";
import type { PaymentConfig, PaymentRequest, PaymentUrlResponse } from "../types";

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
  const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
  const password1 = process.env.ROBOKASSA_PASSWORD_1;
  const password2 = process.env.ROBOKASSA_PASSWORD_2;

  if (!merchantLogin || !password1 || !password2) {
    return null;
  }

  return {
    merchantLogin,
    password1,
    password2,
    isTest: process.env.ROBOKASSA_IS_TEST === "true",
    hashAlgorithm: (process.env.ROBOKASSA_HASH_ALGORITHM as "md5" | "sha256" | "sha512") || "md5",
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
export async function generatePaymentUrl(
  request: PaymentRequest,
): Promise<PaymentUrlResponse> {
  const robokassa = getRobokassa();

  // Конвертируем сумму из копеек в рубли
  const outSum = (request.amount / 100).toFixed(2);

  const url = robokassa.generatePaymentUrl({
    outSum,
    description: request.description,
    invId: typeof request.orderId === "number" ? request.orderId : Number(request.orderId),
    userParameters: request.userParameters,
    receipt: {
      items: [
        {
          sum: request.amount,
          name: request.description,
          quantity: 1,
          payment_method: "full_payment",
          payment_object: "service",
          tax: "none",
        },
      ],
    },
  });

  return { url };
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
  _isResultUrl: boolean = false,
): boolean {
  const robokassa = getRobokassa();

  // Преобразуем данные в формат, ожидаемый библиотекой
  // Библиотека ожидает PascalCase для обязательных полей
  // и lowercase для пользовательских параметров (Shp_*)
  const response = {
    InvId: Number(data.InvId),
    OutSum: data.OutSum,
    SignatureValue: data.SignatureValue,
    Fee: data.Fee || "0.00",
    PaymentMethod: data.PaymentMethod || "unknown",
    IncCurrLabel: data.IncCurrLabel || "RUR",
    ...(data.EMail && { EMail: data.EMail }),
    // Пользовательские параметры (Shp_*) должны быть в lowercase
    ...Object.fromEntries(
      Object.entries(data.Shp_ || {}).map(([key, value]) => [
        key.toLowerCase(),
        value,
      ]),
    ),
  };

  return robokassa.checkPayment(response as Parameters<typeof robokassa.checkPayment>[0]);
}
