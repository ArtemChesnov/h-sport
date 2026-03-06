/**
 * GET /api/admin/logs/security
 * Список событий безопасности (неудачные логины, rate limit, неверная подпись). Только для администраторов.
 */

import { getSecurityLogs } from "@/shared/services/server/admin/logs.service";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { normalizeAdminPaginationParams } from "@/shared/lib/pagination";
import type { ErrorResponse } from "@/shared/dto";
import { SecurityEventType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const VALID_TYPES: SecurityEventType[] = ["FAILED_LOGIN", "RATE_LIMIT", "INVALID_PAYMENT_SIGNATURE"];

async function getHandler(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const { page, perPage } = normalizeAdminPaginationParams(
    searchParams.get("page"),
    searchParams.get("perPage")
  );
  const typeRaw = searchParams.get("type")?.toUpperCase();
  const type = typeRaw && VALID_TYPES.includes(typeRaw as SecurityEventType)
    ? (typeRaw as SecurityEventType)
    : undefined;

  const skip = (page - 1) * perPage;

  const { items, total } = await getSecurityLogs(skip, perPage, type);

  return NextResponse.json({
    items,
    pagination: { page, perPage, total },
  });
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<unknown> | NextResponse<ErrorResponse>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/logs/security");
}
