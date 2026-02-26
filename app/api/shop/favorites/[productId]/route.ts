import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { DTO } from "@/shared/services";
import { removeFavorite } from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ productId: string }>;

/**
 * DELETE /api/shop/favorites/:productId
 *
 * Удаляет товар из избранного и возвращает актуальный список избранных товаров.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<DTO.FavoritesResponseDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "cart");
      if (rateLimitResponse) return rateLimitResponse;

      const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
      const user = await getSessionUserFromRequest(req);
      if (!user) return createErrorResponse("Требуется авторизация", 401);

      const { productId: productIdParam } = await context.params;
      const productId = Number(productIdParam);
      if (!Number.isInteger(productId) || productId <= 0) {
        return createErrorResponse("Invalid productId", 400);
      }

      const result = await removeFavorite(user.id, productId);
      if (result == null) return createErrorResponse("Product not found", 404);

      return NextResponse.json<DTO.FavoritesResponseDto>({ items: result.items }, { status: 200 });
    },
    request,
    "DELETE /api/shop/favorites/[productId]",
  );
}
