import {
  buildPaginatedResponse,
  calculateSkip,
  normalizeAdminPaginationParams,
} from "@/shared/lib/pagination";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { getSubscribersList } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest) {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<ErrorResponse>;

  const sp = new URL(request.url).searchParams;
  const email = sp.get("email")?.trim() ?? "";
  const isConfirmedParam = sp.get("isConfirmed");
  const { page, perPage } = normalizeAdminPaginationParams(sp.get("page"), sp.get("perPage"));

  let isConfirmed: boolean | undefined;
  if (isConfirmedParam === "true") isConfirmed = true;
  if (isConfirmedParam === "false") isConfirmed = false;

  const { items, total } = await getSubscribersList({
    email: email || undefined,
    isConfirmed,
    page,
    perPage,
    skip: calculateSkip(page, perPage),
  });

  return NextResponse.json(buildPaginatedResponse(items, total, page, perPage), { status: 200 });
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ErrorResponse | ReturnType<typeof buildPaginatedResponse>>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/newsletter/subscribers");
}
