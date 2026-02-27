import {
  buildPaginatedResponse,
  calculateSkip,
  normalizeAdminPaginationParams,
} from "@/shared/lib/pagination";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createValidationErrorResponse } from "@/shared/lib/api/error-response";
import { createPromo, getPromosList, type CreatePromoInput } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest) {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<ErrorResponse>;

  const sp = new URL(request.url).searchParams;
  const code = sp.get("code")?.trim() ?? "";
  const isActiveParam = sp.get("isActive");
  const { page, perPage } = normalizeAdminPaginationParams(sp.get("page"), sp.get("perPage"));

  let isActive: boolean | undefined;
  if (isActiveParam === "true") isActive = true;
  if (isActiveParam === "false") isActive = false;

  const { items, total } = await getPromosList({
    code: code || undefined,
    isActive,
    page,
    perPage,
    skip: calculateSkip(page, perPage),
  });

  return NextResponse.json(buildPaginatedResponse(items, total, page, perPage), { status: 200 });
}

async function postHandler(request: NextRequest) {
  const sizeCheck = validateRequestSize(request, 100 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<ErrorResponse>;

  const body = (await request.json()) as CreatePromoInput;
  const result = await createPromo(body);

  if (!result.ok) {
    return createValidationErrorResponse("Ошибка валидации промокода", result.errors, 400);
  }

  return NextResponse.json(result.promo, { status: 201 });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/admin/promos");
}

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandler, request, "POST /api/admin/promos");
}
