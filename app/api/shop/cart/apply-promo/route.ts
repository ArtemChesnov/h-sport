import { CART_COOKIE_MAX_AGE } from "@/shared/lib/cart";
import {
  applyPromoToCart,
  CART_COOKIE_NAME,
  getOrCreateCartCore,
  loadCartWithRelations,
  mapCartToDto,
  recalculateCartAggregates,
} from "@/shared/services/server";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createValidationErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { DTO } from "@/shared/services";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/** POST /api/shop/cart/apply-promo. Rate limit cart. */
async function handler(
  request: NextRequest,
): Promise<NextResponse<DTO.CartDto> | NextResponse<ErrorResponse>> {
  const rateLimitResponse = await applyRateLimit(request, "cart");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const body = (await request.json()) as DTO.PromoCodeApplyRequestDto | null;

  if (!body || typeof body.code !== "string") {
    return createValidationErrorResponse(
      "Ошибка валидации",
      [{ field: "code", message: "Некорректный запрос: не передан code." }],
      400,
    );
  }

  const { cart, newToken } = await getOrCreateCartCore(request);
  const fullCart = await loadCartWithRelations(cart.id);
  const cartDto = mapCartToDto(fullCart);

  if (!cartDto.items.length) {
    return createValidationErrorResponse(
      "Ошибка валидации",
      [{ field: "_global", message: "Корзина пуста — промокод применить нельзя." }],
      400,
    );
  }

  const subtotal = cartDto.subtotal ?? cartDto.total ?? 0;
  const result = await applyPromoToCart(body.code, cart.id, subtotal, cart.userId);

  if (!result.ok) {
    return createValidationErrorResponse(
      "Ошибка валидации промокода",
      [{ field: result.field, message: result.message }],
      400,
    );
  }

  await recalculateCartAggregates(cart.id);
  const updatedCart = await loadCartWithRelations(cart.id);
  const updatedDto = mapCartToDto(updatedCart);
  const response = NextResponse.json<DTO.CartDto>(updatedDto, { status: 200 });

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
  request: NextRequest,
): Promise<NextResponse<DTO.CartDto | ErrorResponse>> {
  return withErrorHandling(handler, request, "POST /api/shop/cart/apply-promo");
}
