import { CACHE_CONTROL_FAVORITES } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
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

        const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
        const user = await getSessionUserFromRequest(req);
        if (!user) return createErrorResponse("Требуется авторизация", 401);

        const items = await loadUserFavoritesList(user.id);
        return NextResponse.json<DTO.FavoritesResponseDto>({ items }, {
          status: 200,
          headers: { "Cache-Control": CACHE_CONTROL_FAVORITES },
        });
      },
      request,
      "GET /api/shop/favorites",
    );
  },
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

        const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
        const user = await getSessionUserFromRequest(req);
        if (!user) return createErrorResponse("Требуется авторизация", 401);

        let body: { productId: number };
        try {
          body = (await req.json()) as { productId: number };
        } catch {
          return createErrorResponse("Invalid JSON body", 400);
        }

        const productId = Number(body.productId);
        if (!Number.isInteger(productId) || productId <= 0) {
          return createErrorResponse("Invalid productId", 400);
        }

        const result = await addFavorite(user.id, productId);
        if (result == null) return createErrorResponse("Product not found", 404);

        return NextResponse.json<DTO.FavoritesResponseDto>({ items: result.items }, { status: 200 });
      },
      request,
      "POST /api/shop/favorites",
    );
  },
);
