import { CACHE_CONTROL_CART } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { CART_COOKIE_MAX_AGE } from "@/shared/lib/cart";
import { DTO } from "@/shared/services";
import {
  CART_COOKIE_NAME,
  getOrCreateCartCore,
  loadCartWithRelations,
  mapCartToDto,
  recalculateCartAggregates,
  removeUnavailableItems,
} from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

const getHandlerWithMetrics = withMetricsAuto(async (
  request: NextRequest,
): Promise<NextResponse<DTO.CartDto | ErrorResponse>> => {
  const rateLimitResponse = await applyRateLimit(request, "cart");
  if (rateLimitResponse) return rateLimitResponse;

  const { cart, newToken } = await getOrCreateCartCore(request);
  const hadUnavailableItems = await removeUnavailableItems(cart.id);
  if (hadUnavailableItems || cart.promoCodeId) {
    await recalculateCartAggregates(cart.id, undefined, true);
  }
  const fullCart = await loadCartWithRelations(cart.id);
  const dto = mapCartToDto(fullCart);

  const response = NextResponse.json<DTO.CartDto>(
    dto,
    {
      status: 200,
      headers: {
        "Cache-Control": CACHE_CONTROL_CART,
      },
    },
  );

  if (newToken) {
    response.cookies.set(CART_COOKIE_NAME, newToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  }

  return response;
});

export async function GET(
  request: NextRequest,
): Promise<NextResponse<DTO.CartDto | ErrorResponse>> {
  return withErrorHandling(getHandlerWithMetrics, request, "GET /api/shop/cart");
}
