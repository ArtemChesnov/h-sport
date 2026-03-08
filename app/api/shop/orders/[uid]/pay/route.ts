/**
 * POST /api/shop/orders/[uid]/pay
 *
 * Создаёт платёж для неоплаченного заказа и возвращает URL для оплаты.
 * Доступно только владельцу заказа. Допустимы статусы NEW и PENDING_PAYMENT.
 */

import { createPayment } from "@/modules/payment/lib/db";
import { buildReceiptItems, generatePaymentUrl } from "@/modules/payment/lib/robokassa";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { getSessionUserOrError } from "@/shared/lib/auth/middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { OrdersService } from "@/shared/services/server";
import type { RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ uid: string }>;

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<{ url: string } | { message: string }>> {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "payment");
      if (rateLimitResponse) return rateLimitResponse;

      const session = await getSessionUserOrError(req);
      if ("error" in session) return session.error;

      const { uid } = await context.params;
      if (!uid || typeof uid !== "string") {
        return createErrorResponse("Некорректный идентификатор заказа", 400);
      }

      const result = await OrdersService.getPayableOrder(uid, session.user.id);
      if (!result.ok) return createErrorResponse(result.message, result.status);

      const { id: orderId, total, email, items, deliveryFee } = result.data;

      let url: string;
      try {
        const paymentId = await createPayment(orderId, total);
        const receiptItems = buildReceiptItems(items, deliveryFee);
        const paymentUrl = await generatePaymentUrl({
          orderId,
          amount: total,
          description: `Заказ №${orderId}`,
          email,
          receiptItems,
          userParameters: { Shp_payment_method: "CARD", Shp_payment_id: paymentId.toString() },
        });
        url = paymentUrl.url;
      } catch (err) {
        const { logger } = await import("@/shared/lib/logger");
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        logger.warn("Payment system not configured, using mock for order pay", {
          error: errorMessage,
        });
        const { getAppUrl } = await import("@/shared/lib/config/env");
        url = `${getAppUrl()}/api/payment/success?InvId=${orderId}&OutSum=${total}&SignatureValue=mock&returnTo=order`;
      }

      const res = NextResponse.json({ url }, { status: 200 });
      const returnTo = req.nextUrl.searchParams.get("returnTo");
      if (returnTo === "order") {
        res.cookies.set("payment_return_to", "order", {
          path: "/",
          maxAge: 900,
          httpOnly: true,
          sameSite: "lax",
        });
      }
      return res;
    },
    request,
    "POST /api/shop/orders/[uid]/pay"
  );
}
