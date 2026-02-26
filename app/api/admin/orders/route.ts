import {
  normalizeAdminPaginationParams,
  validateEmailQuery,
  validatePhoneQuery,
  validateUidQuery,
  validateSearchQuery,
} from "@/shared/lib";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { DTO } from "@/shared/services";
import { getAdminOrdersList } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/(admin)/orders
 */
async function getHandler(
  request: NextRequest,
): Promise<NextResponse<DTO.AdminOrdersListResponseDto>> {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) {
    return authError as NextResponse<DTO.AdminOrdersListResponseDto>;
  }

  const { searchParams } = new URL(request.url);
  const { page, perPage } = normalizeAdminPaginationParams(
    searchParams.get("page"),
    searchParams.get("perPage"),
  );

  const status = searchParams.get("status") as DTO.OrderStatusDto | null;
  const email = validateEmailQuery(searchParams.get("email"));
  const phone = validatePhoneQuery(searchParams.get("phone"));
  const uid = validateUidQuery(searchParams.get("uid"));
  const q = validateSearchQuery(searchParams.get("q")) || undefined;

  const response = await getAdminOrdersList({
    status: status ?? undefined,
    email: email ?? undefined,
    phone: phone ?? undefined,
    uid: uid ?? undefined,
    q,
    page,
    perPage,
  });

  return NextResponse.json<DTO.AdminOrdersListResponseDto>(response);
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<DTO.AdminOrdersListResponseDto | ErrorResponse>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/orders");
}
