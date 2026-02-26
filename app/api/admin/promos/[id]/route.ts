import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { DTO } from "@/shared/services";
import { deletePromo, patchPromo } from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ id: string }>;

/**
 * PATCH /api/(admin)/promos/:id
 *
 * Частичное обновление промокода.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<DTO.AdminPromoCodeDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<DTO.AdminPromoCodeDto>;

      const { id: rawId } = await context.params;
      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0) return createErrorResponse("Некорректный id", 400);

      const body = (await req.json()) as DTO.AdminPromoCodeUpdateDto;
      const result = await patchPromo(id, body);
      if (!result.ok) return createErrorResponse(result.error, result.status);

      return NextResponse.json<DTO.AdminPromoCodeDto>(result.promo, { status: 200 });
    },
    request,
    "PATCH /api/admin/promos/[id]",
  );
}

/**
 * DELETE /api/(admin)/promos/:id
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<{ ok: true } | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<ErrorResponse>;

      const { id: rawId } = await context.params;
      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0) return createErrorResponse("Некорректный id", 400);

      await deletePromo(id);
      return NextResponse.json<{ ok: true }>({ ok: true }, { status: 200 });
    },
    _request,
    "DELETE /api/admin/promos/[id]",
  );
}
