/**
 * GET /api/payment/success
 *
 * Обработка успешной оплаты (Success URL от Robokassa)
 * Перенаправляет пользователя на страницу успеха
 */

import { checkSuccessSignature } from "@/modules/payment/lib/robokassa";
import { OrderForPaymentService } from "@/shared/services/server";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { logger } from "@/shared/lib/logger";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const InvId = searchParams.get("InvId");
  const OutSum = searchParams.get("OutSum");
  const SignatureValue = searchParams.get("SignatureValue");

  if (!InvId || !OutSum) {
    return NextResponse.redirect(new URL("/checkout?error=payment_failed", request.url));
  }

  if (SignatureValue && SignatureValue !== "mock") {
    const shpParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("Shp_") || key.startsWith("SHP_") || key.startsWith("shp_")) {
        shpParams[key] = value;
      }
    }

    const isValid = checkSuccessSignature({ InvId, OutSum, SignatureValue, Shp_: shpParams });

    if (!isValid) {
      logger.warn("GET /api/payment/success: Неверная подпись", { InvId, OutSum });
      return NextResponse.redirect(new URL("/checkout?error=invalid_signature", request.url));
    }
  } else if (SignatureValue === "mock") {
    logger.info("GET /api/payment/success: Используется mock режим для тестирования", {
      InvId,
      OutSum,
    });
  }

  const orderId = parseInt(InvId, 10);
  if (isNaN(orderId)) {
    return NextResponse.redirect(new URL("/checkout?error=invalid_order", request.url));
  }

  const order = await OrderForPaymentService.getOrderForSuccessEmail(orderId);

  if (order) {
    try {
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
    } catch (error) {
      logger.error("GET /api/payment/success: Ошибка при подготовке отправки email", error);
    }

    const returnToOrder =
      searchParams.get("returnTo") === "order" ||
      request.cookies.get("payment_return_to")?.value === "order";

    const redirectUrl = returnToOrder
      ? `/account/orders/${order.uid}`
      : `/checkout/success?uid=${order.uid}`;

    const redirect = NextResponse.redirect(new URL(redirectUrl, request.url));
    if (returnToOrder) {
      redirect.cookies.delete("payment_return_to");
    }
    return redirect;
  }

  return NextResponse.redirect(new URL(`/checkout/success?orderId=${orderId}`, request.url));
}

export async function GET(request: NextRequest) {
  try {
    return await withErrorHandling(handler, request, "GET /api/payment/success");
  } catch (error) {
    logger.error("GET /api/payment/success: Ошибка при обработке успешной оплаты", error);
    return NextResponse.redirect(new URL("/checkout?error=payment_error", request.url));
  }
}
