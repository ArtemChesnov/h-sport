import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { DTO } from "@/shared/services";
import { OrdersService } from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ uid: string }>;

/**
 * POST /api/shop/orders/[uid]/cancel
 *
 * Отмена заказа пользователем в ЛК.
 * Допускаются статусы NEW и PENDING_PAYMENT.
 */
export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<DTO.OrderCancelResponseDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "orderCancel");
      if (rateLimitResponse) return rateLimitResponse;

      const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
      const user = await getSessionUserFromRequest(req);
      if (!user) return createErrorResponse("Требуется авторизация", 401);

      const { uid } = await context.params;
      if (!uid || typeof uid !== "string") {
        return createErrorResponse("Некорректный идентификатор заказа", 400);
      }

      const result = await OrdersService.cancelOrder(uid, user.id);
      if (!result.ok) return createErrorResponse(result.message, result.status);

      return NextResponse.json<DTO.OrderCancelResponseDto>(result.data, { status: 200 });
    },
    request,
    "POST /api/shop/orders/[uid]/cancel",
  );
}
