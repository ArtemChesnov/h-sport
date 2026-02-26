import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { deleteSubscription } from "@/shared/services/server";
import type { RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ id: string }>;

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError;

      const id = parseInt((await context.params).id, 10);
      if (Number.isNaN(id)) {
        return createErrorResponse("Некорректный ID", 400);
      }

      const deleted = await deleteSubscription(id);
      if (!deleted) {
        return createErrorResponse("Подписчик не найден", 404);
      }

      return new NextResponse(null, { status: 204 });
    },
    request,
    "DELETE /api/admin/newsletter/subscribers/[id]",
  );
}
