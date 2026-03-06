/**
 * GET /api/admin/logs/webhooks
 * Список входящих webhook-вызовов. Только для администраторов.
 */

import { getWebhookLogs } from "@/shared/services/server/admin/logs.service";
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
  const source = searchParams.get("source")?.trim() || undefined;
  const skip = (page - 1) * perPage;

  const { items, total } = await getWebhookLogs(skip, perPage, source);

  return NextResponse.json({
    items,
    pagination: { page, perPage, total },
  });
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<unknown> | NextResponse<ErrorResponse>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/logs/webhooks");
}
