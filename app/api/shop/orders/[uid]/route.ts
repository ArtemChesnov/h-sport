import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { DTO } from "@/shared/services";
import { OrdersService } from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ uid: string }>;

/**
 * GET /api/shop/orders/[uid]
 *
 * Детальная информация по заказу для ЛК.
 * Находит заказ ТОЛЬКО текущего пользователя (userId + uid).
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<DTO.OrderDetailDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "orders");
      if (rateLimitResponse) return rateLimitResponse;

      const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
      const user = await getSessionUserFromRequest(req);
      if (!user) return createErrorResponse("Требуется авторизация", 401);

      const { uid } = await context.params;
      if (!uid || typeof uid !== "string") {
        return createErrorResponse("Некорректный идентификатор заказа", 400);
      }

      const dto = await OrdersService.getOrderDetail(uid, user.id);
      if (!dto) return createErrorResponse("Заказ не найден", 404);

      return NextResponse.json<DTO.OrderDetailDto>(dto, { status: 200 });
    },
    request,
    "GET /api/shop/orders/[uid]",
  );
}
