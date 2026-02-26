/**
 * GET /api/payment/fail
 *
 * Обработка неуспешной оплаты (Failure URL от Robokassa)
 * Перенаправляет пользователя на страницу ошибки
 */

import { NextRequest, NextResponse } from "next/server";
import { findPaymentByOrderId, updatePaymentStatus, createOrderEvent } from "@/modules/payment/lib/db";
import { logger } from "@/shared/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const InvId = searchParams.get("InvId");

    if (InvId) {
      const orderId = parseInt(InvId, 10);
      if (!isNaN(orderId)) {
        // Обновляем статус платежа
        const payment = await findPaymentByOrderId(orderId);
        if (payment) {
          await updatePaymentStatus(payment.id, "CANCELED");
          await createOrderEvent(orderId, "PAYMENT_FAILED", {
            paymentId: payment.id,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Перенаправляем на страницу ошибки
    return NextResponse.redirect(new URL("/checkout?error=payment_canceled", request.url));
  } catch (error) {
    logger.error("GET /api/payment/fail: Ошибка при обработке неуспешной оплаты", error);
    return NextResponse.redirect(new URL("/checkout?error=payment_error", request.url));
  }
}
