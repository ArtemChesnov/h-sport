import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { CART_COOKIE_MAX_AGE } from "@/shared/lib/cart";
import { DTO } from "@/shared/services";
import {
  CART_COOKIE_NAME,
  clearCartPromo,
  getOrCreateCartCore,
  loadCartWithRelations,
  mapCartToDto,
  recalculateCartAggregates,
} from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/** POST /api/shop/cart/clear-promo. Rate limit cart. */
async function handler(
  request: NextRequest,
): Promise<NextResponse<DTO.CartDto> | NextResponse<ErrorResponse>> {
  const rateLimitResponse = await applyRateLimit(request, "cart");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const { cart, newToken } = await getOrCreateCartCore(request);
  await clearCartPromo(cart.id);
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
  return withErrorHandling(handler, request, "POST /api/shop/cart/clear-promo");
}
