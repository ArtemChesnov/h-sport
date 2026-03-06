/**
 * GET /api/admin/logs/client-errors
 * Список клиентских ошибок (ErrorBoundary). Только для администраторов.
 */

import { getClientErrorLogs } from "@/shared/services/server/admin/logs.service";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { normalizeAdminPaginationParams } from "@/shared/lib/pagination";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const { page, perPage } = normalizeAdminPaginationParams(
    searchParams.get("page"),
    searchParams.get("perPage")
  );
  const skip = (page - 1) * perPage;

  const { items, total } = await getClientErrorLogs(skip, perPage);

  return NextResponse.json({
    items,
    pagination: { page, perPage, total },
  });
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<unknown> | NextResponse<ErrorResponse>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/logs/client-errors");
}
