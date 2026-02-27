import { normalizeAdminPaginationParams } from "@/shared/lib/pagination";
import { validateSearchQuery } from "@/shared/lib/validation";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { DTO } from "@/shared/services";
import { getAdminUsersList } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/(admin)/users
 *
 * Список пользователей + агрегированные метрики.
 */
async function getHandler(
  request: NextRequest
): Promise<NextResponse<DTO.AdminUsersListResponseDto>> {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<DTO.AdminUsersListResponseDto>;

  const { searchParams } = new URL(request.url);
  const { page, perPage } = normalizeAdminPaginationParams(
    searchParams.get("page"),
    searchParams.get("perPage")
  );
  const search = validateSearchQuery(searchParams.get("search")) ?? "";

  const response = await getAdminUsersList({ search, page, perPage });
  return NextResponse.json<DTO.AdminUsersListResponseDto>(response, { status: 200 });
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DTO.AdminUsersListResponseDto | ErrorResponse>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/users");
}
