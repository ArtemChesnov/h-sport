import { CACHE_CONTROL_FAVORITES } from "@/shared/constants";
import { favoriteProductIdSchema } from "@/shared/lib/api/request-body-schemas";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { validateRequestBody } from "@/shared/lib/api/validate-request-body";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { getSessionUserOrError } from "@/shared/lib/auth/middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { DTO } from "@/shared/services";
import { addFavorite, loadUserFavoritesList } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shop/favorites
 *
 * Возвращает список избранных товаров пользователя.
 * Кэширование: 30 секунд (данные могут меняться при добавлении/удалении)
 */
export const GET = withMetricsAuto(
  async (request: NextRequest): Promise<NextResponse<DTO.FavoritesResponseDto | ErrorResponse>> => {
    return withErrorHandling(
      async (req) => {
        const rateLimitResponse = await applyRateLimit(req, "cart");
        if (rateLimitResponse) return rateLimitResponse;

        const session = await getSessionUserOrError(req);
        if ("error" in session) return session.error;
        const items = await loadUserFavoritesList(session.user.id);
        return NextResponse.json<DTO.FavoritesResponseDto>(
          { items },
          {
            status: 200,
            headers: { "Cache-Control": CACHE_CONTROL_FAVORITES },
          }
        );
      },
      request,
      "GET /api/shop/favorites"
    );
  }
);

/**
 * POST /api/shop/favorites
 *
 * Body: { productId: number }
 */
export const POST = withMetricsAuto(
  async (request: NextRequest): Promise<NextResponse<DTO.FavoritesResponseDto | ErrorResponse>> => {
    return withErrorHandling(
      async (req) => {
        const rateLimitResponse = await applyRateLimit(req, "cart");
        if (rateLimitResponse) return rateLimitResponse;

        const session = await getSessionUserOrError(req);
        if ("error" in session) return session.error;

        const bodyResult = await validateRequestBody(req, favoriteProductIdSchema);
        if ("error" in bodyResult) return bodyResult.error;
        const { productId } = bodyResult.data;

        const result = await addFavorite(session.user.id, productId);
        if (result == null) return createErrorResponse("Товар не найден", 404);

        return NextResponse.json<DTO.FavoritesResponseDto>(
          { items: result.items },
          { status: 200 }
        );
      },
      request,
      "POST /api/shop/favorites"
    );
  }
);
