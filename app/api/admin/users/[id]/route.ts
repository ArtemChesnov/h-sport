import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { isPrivilegedEmail } from "@/shared/lib/auth/privileged";
import { DTO } from "@/shared/services";
import { getAdminUserById, updateAdminUserRole } from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ id: string }>;

/**
 * GET /api/(admin)/users/:id
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<DTO.AdminUserDetailDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<DTO.AdminUserDetailDto>;

      const { id } = await context.params;
      if (!id || typeof id !== "string") {
        return createErrorResponse("Некорректный идентификатор пользователя", 400);
      }

      const dto = await getAdminUserById(id);
      if (!dto) {
        return createErrorResponse("Пользователь не найден", 404);
      }
      if (isPrivilegedEmail(dto.email)) {
        return createErrorResponse("Пользователь не найден", 404);
      }
      return NextResponse.json(dto, { status: 200 });
    },
    _request,
    "GET /api/admin/users/[id]",
  );
}

/**
 * PATCH /api/(admin)/users/:id
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<DTO.AdminUserUpdateResponseDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<DTO.AdminUserUpdateResponseDto>;

      const { id } = await context.params;
      if (!id || typeof id !== "string") {
        return createErrorResponse("Некорректный идентификатор пользователя", 400);
      }

      let body: DTO.AdminUserUpdateRequestDto;
      try {
        body = (await req.json()) as DTO.AdminUserUpdateRequestDto;
      } catch {
        return createErrorResponse("Некорректное тело запроса", 400);
      }

      if (body.role !== "USER" && body.role !== "ADMIN") {
        return createErrorResponse("Некорректная роль", 400);
      }

      const existing = await getAdminUserById(id);
      if (!existing) {
        return createErrorResponse("Пользователь не найден", 404);
      }
      if (isPrivilegedEmail(existing.email)) {
        return createErrorResponse("Действие запрещено", 403);
      }

      const updated = await updateAdminUserRole(id, body.role);
      return NextResponse.json<DTO.AdminUserUpdateResponseDto>(updated, { status: 200 });
    },
    request,
    "PATCH /api/admin/users/[id]",
  );
}
