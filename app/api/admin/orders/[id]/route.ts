/**
 * Фасад для API routes работы с заказами (admin).
 * Вся логика в shared/services/server/admin/orders.
 */

import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { DTO } from "@/shared/services";
import { getAdminOrderDetail, updateAdminOrder } from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ id: string }>;

export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<DTO.OrderDetailDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<DTO.OrderDetailDto>;

      const { id: idParam } = await context.params;
      const id = Number(idParam);

      if (!Number.isInteger(id) || id <= 0) {
        return createErrorResponse("Некорректный идентификатор заказа", 400);
      }

      const order = await getAdminOrderDetail(id);
      if (!order) {
        return createErrorResponse("Заказ не найден", 404);
      }

      return NextResponse.json<DTO.OrderDetailDto>(order, { status: 200 });
    },
    _request,
    "GET /api/admin/orders/[id]",
  );
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<DTO.OrderAdminUpdateResponseDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<DTO.OrderAdminUpdateResponseDto>;

      const { id: idParam } = await context.params;
      const id = Number(idParam);

      if (!Number.isInteger(id) || id <= 0) {
        return createErrorResponse("Некорректный идентификатор заказа", 400);
      }

      let body: DTO.OrderAdminUpdateRequestDto;
      try {
        body = (await req.json()) as DTO.OrderAdminUpdateRequestDto;
      } catch {
        return createErrorResponse("Некорректное тело запроса", 400);
      }

      const result = await updateAdminOrder(id, body);

      if (!result.ok) {
        return createErrorResponse(result.validationError, 400);
      }

      return NextResponse.json<DTO.OrderAdminUpdateResponseDto>(result.order, {
        status: 200,
      });
    },
    request,
    "PATCH /api/admin/orders/[id]",
  );
}
