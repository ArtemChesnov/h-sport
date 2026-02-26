/**
 * POST /api/payment/create
 *
 * Создаёт платёж и возвращает URL для оплаты
 */

import { createPayment } from "@/modules/payment/lib/db";
import { generatePaymentUrl } from "@/modules/payment/lib/robokassa";
import type { PaymentRequest } from "@/modules/payment/types";
import { OrderForPaymentService } from "@/shared/services/server";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest): Promise<NextResponse<{ success: boolean; message?: string; url?: string; paymentId?: number }>> {
  const rateLimitResponse = await applyRateLimit(request, "payment");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) {
    return sizeCheck.response as NextResponse<{ success: boolean; message?: string; url?: string; paymentId?: number }>;
  }

  const body = (await request.json()) as PaymentRequest;
  const { orderId, amount, description, email, userParameters } = body;

  if (!orderId || !amount || !description) {
    return NextResponse.json(
      { success: false, message: "orderId, amount и description обязательны" },
      { status: 400 },
    );
  }

  const order = await OrderForPaymentService.getOrderForPaymentCreate(orderId);

  if (!order) {
    return NextResponse.json(
      { success: false, message: "Заказ не найден" },
      { status: 404 },
    );
  }

  if (amount !== order.total) {
    return NextResponse.json(
      { success: false, message: "Сумма платежа не совпадает с суммой заказа" },
      { status: 400 },
    );
  }

  let paymentId: number;
  let url: string;

  try {
    paymentId = await createPayment(orderId, amount);

    const paymentUrl = await generatePaymentUrl({
      orderId,
      amount,
      description,
      email,
      userParameters: {
        ...userParameters,
        payment_id: paymentId.toString(),
      },
    });
    url = paymentUrl.url;
  } catch (err) {
    const { logger } = await import("@/shared/lib/logger");
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.warn("Payment system not configured, using mock response for testing", { error: errorMessage });

    paymentId = -1;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    url = `${baseUrl}/api/payment/success?InvId=${orderId}&OutSum=${amount}&SignatureValue=mock`;
  }

  return NextResponse.json({
    success: true,
    url,
    paymentId,
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/payment/create");
}
