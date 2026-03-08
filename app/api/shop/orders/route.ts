import { CACHE_CONTROL_ORDERS } from "@/shared/constants";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { validateRequestBody } from "@/shared/lib/api/validate-request-body";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getSessionUserOrError } from "@/shared/lib/auth/middleware";
import { normalizePaginationParams } from "@/shared/lib/pagination";
import { orderCreateSchema } from "@/shared/lib/validation/zod-schemas";
import { DTO } from "@/shared/services";
import { CART_COOKIE_NAME, OrdersService } from "@/shared/services/server";
import {
  createOrderFromCart,
  getOrCreateUserByEmail,
  isEmailVerified,
} from "@/shared/services/server/shop/orders/order-creation.service";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/shop/orders. Cache 1m, rate limit orders. */
export async function GET(request: NextRequest) {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "orders");
      if (rateLimitResponse) return rateLimitResponse;

      const session = await getSessionUserOrError(req);
      if ("error" in session) return session.error;

      const { searchParams } = new URL(req.url);
      const { page, perPage } = normalizePaginationParams(
        searchParams.get("page"),
        searchParams.get("perPage"),
        50,
        10
      );
      const response = await OrdersService.getUserOrders(session.user.id, page, perPage);
      return NextResponse.json<DTO.OrdersListResponseDto>(response, {
        status: 200,
        headers: { "Cache-Control": CACHE_CONTROL_ORDERS },
      });
    },
    request,
    "GET /api/shop/orders"
  );
}

/** POST /api/shop/orders. Корзина по cookie, промокод, создание user по email. */
export async function POST(request: NextRequest) {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "orders");
      if (rateLimitResponse) return rateLimitResponse;

      const sizeCheck = validateRequestSize(req);
      if (!sizeCheck.valid) return sizeCheck.response;

      const session = await getSessionUserOrError(req);
      if ("error" in session) return session.error;

      const idempotencyKey = req.headers.get("X-Idempotency-Key");
      if (idempotencyKey) {
        const existingOrder = await OrdersService.findByIdempotencyKeyForOwner(
          idempotencyKey,
          session.user.id
        );
        if (existingOrder) {
          return NextResponse.json<DTO.OrderCreateResponseDto>(existingOrder);
        }
      }

      const bodyResult = await validateRequestBody(req, orderCreateSchema);
      if ("error" in bodyResult) return bodyResult.error;
      const body = bodyResult.data;

      const email = body.email.trim();
      const fullName = body.fullName?.trim() ?? null;
      const phone = body.phone?.trim() ?? null;

      const userId = await getOrCreateUserByEmail({ email, fullName, phone });

      const verified = await isEmailVerified(userId);
      if (!verified) {
        return createErrorResponse(
          "Для оформления заказа необходимо подтвердить email. Проверьте почту и перейдите по ссылке из письма.",
          403
        );
      }

      const cartToken = req.cookies.get(CART_COOKIE_NAME)?.value;
      if (!cartToken) return createErrorResponse("Корзина пуста", 400);

      const orderResult = await createOrderFromCart({
        userId,
        email,
        phone,
        fullName,
        cartToken,
        delivery: body.delivery,
        idempotencyKey,
      });

      try {
        const { emailData } = orderResult;
        const { sendOrderConfirmationEmailAsync } = await import("@/modules/auth/lib/email");
        sendOrderConfirmationEmailAsync(email, {
          id: emailData.id,
          uid: emailData.uid,
          total: emailData.total,
          totalItems: emailData.totalItems,
          items: emailData.items.map((item) => ({
            productName: item.productName,
            qty: item.qty,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
          deliveryMethod: emailData.delivery.method,
          deliveryAddress: emailData.delivery.address,
          deliveryCity: emailData.delivery.city,
          promoCode: emailData.promoCodeCode,
          discount: emailData.discount,
          deliveryFee: emailData.deliveryFee,
          subtotal: emailData.subtotal,
        });
      } catch (emailError) {
        const { logger } = await import("@/shared/lib/logger");
        logger.error("POST /api/shop/orders: Ошибка при отправке email о заказе", emailError);
      }

      return NextResponse.json<DTO.OrderCreateResponseDto>(orderResult, { status: 201 });
    },
    request,
    "POST /api/shop/orders"
  );
}
