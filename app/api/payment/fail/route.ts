/**
 * GET /api/payment/fail
 *
 * Обработка неуспешной оплаты (Failure URL от Robokassa)
 * Перенаправляет на страницу завершения с сообщением «оплата не прошла»
 */

import {
  findPaymentByOrderId,
  updatePaymentStatus,
  createOrderEvent,
} from "@/modules/payment/lib/db";
import { OrderForPaymentService } from "@/shared/services/server";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { getAppUrl } from "@/shared/lib/config/env";
import { logger } from "@/shared/lib/logger";
import { NextRequest, NextResponse } from "next/server";

function appRedirect(path: string): NextResponse {
  return NextResponse.redirect(new URL(path, getAppUrl()));
}

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const InvId = searchParams.get("InvId");

  if (InvId) {
    const orderId = parseInt(InvId, 10);
    if (!isNaN(orderId)) {
      const payment = await findPaymentByOrderId(orderId);
      if (payment) {
        await updatePaymentStatus(payment.id, "CANCELED");
        await createOrderEvent(orderId, "PAYMENT_FAILED", {
          paymentId: payment.id,
          timestamp: new Date().toISOString(),
        });
      }

      const order = await OrderForPaymentService.getOrderForSuccessEmail(orderId);
      if (order) {
        return appRedirect(`/checkout/success?uid=${order.uid}&paid=0`);
      }
    }
  }

  return appRedirect("/checkout?error=payment_canceled");
}

export async function GET(request: NextRequest) {
  try {
    return await withErrorHandling(handler, request, "GET /api/payment/fail");
  } catch (error) {
    logger.error("GET /api/payment/fail: Ошибка при обработке неуспешной оплаты", error);
    return appRedirect("/checkout?error=payment_error");
  }
}
