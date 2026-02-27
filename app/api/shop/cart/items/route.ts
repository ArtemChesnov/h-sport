import { cartAddItemSchema } from "@/shared/lib/api/request-body-schemas";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { validateRequestBody } from "@/shared/lib/api/validate-request-body";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { CART_COOKIE_MAX_AGE } from "@/shared/lib/cart";
import { DTO } from "@/shared/services";
import {
  addItemToCart,
  CART_COOKIE_NAME,
  getCartItemErrorMessage,
  getOrCreateCartCore,
  loadCartWithRelations,
  mapCartToDto,
  recalculateCartAggregates,
  runCartTransaction,
} from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/** POST /api/shop/cart/items. Rate limit cart. */
async function handler(
  request: NextRequest
): Promise<NextResponse<DTO.CartDto> | NextResponse<ErrorResponse>> {
  const rateLimitResponse = await applyRateLimit(request, "cart");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const bodyResult = await validateRequestBody(request, cartAddItemSchema);
  if ("error" in bodyResult) return bodyResult.error;
  const { productItemId, qty } = bodyResult.data;
  const { cart, newToken } = await getOrCreateCartCore(request);

  const result = await runCartTransaction((tx) =>
    addItemToCart(tx, cart.id, productItemId, qty, (cartId, txClient) =>
      recalculateCartAggregates(cartId, txClient)
    )
  );

  if (!result.ok) {
    return createErrorResponse(getCartItemErrorMessage(result.code), 400);
  }

  recordCartMetrics(request, result.productId, qty, cart.cartToken).catch((err) => {
    console.error("[cart/items] Failed to record cart metrics:", err);
  });

  const fullCart = await loadCartWithRelations(cart.id);
  const dto = mapCartToDto(fullCart);
  const response = NextResponse.json<DTO.CartDto>(dto, { status: 200 });
  if (newToken) {
    response.cookies.set(CART_COOKIE_NAME, newToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  }
  return response;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<DTO.CartDto | ErrorResponse>> {
  return withErrorHandling(handler, request, "POST /api/shop/cart/items");
}

/** Записывает метрики добавления в корзину (асинхронно) */
async function recordCartMetrics(
  request: NextRequest,
  productId: number,
  qty: number,
  cartToken: string | null
) {
  const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
  const user = await getSessionUserFromRequest(request);
  const { recordCartAction, recordConversion } = await import("@/shared/lib/ecommerce-metrics");
  recordCartAction("add", productId, qty, user?.id, cartToken || undefined);
  recordConversion("view_to_cart", productId, undefined, user?.id);
}
