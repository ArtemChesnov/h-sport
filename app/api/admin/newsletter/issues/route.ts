import { newsletterIssueCreateSchema } from "@/shared/lib/api/request-body-schemas";
import {
  buildPaginatedResponse,
  calculateSkip,
  normalizeAdminPaginationParams,
} from "@/shared/lib/pagination";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { validateRequestBody } from "@/shared/lib/api/validate-request-body";
import { createNewsletterIssue, getNewsletterIssuesList } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest) {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<ErrorResponse>;

  const sp = new URL(request.url).searchParams;
  const { page, perPage } = normalizeAdminPaginationParams(sp.get("page"), sp.get("perPage"));

  const { items, total } = await getNewsletterIssuesList({
    page,
    perPage,
    skip: calculateSkip(page, perPage),
  });

  return NextResponse.json(buildPaginatedResponse(items, total, page, perPage), { status: 200 });
}

async function postHandler(request: NextRequest) {
  const sizeCheck = validateRequestSize(request, 500 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<ErrorResponse>;

  const bodyResult = await validateRequestBody(request, newsletterIssueCreateSchema);
  if ("error" in bodyResult) return bodyResult.error;

  const issue = await createNewsletterIssue(bodyResult.data);
  return NextResponse.json(issue, { status: 201 });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/admin/newsletter/issues");
}

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandler, request, "POST /api/admin/newsletter/issues");
}
