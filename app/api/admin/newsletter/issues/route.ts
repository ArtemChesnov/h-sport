import { buildPaginatedResponse, calculateSkip, normalizeAdminPaginationParams } from "@/shared/lib";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import {
  createNewsletterIssue,
  getNewsletterIssuesList,
} from "@/shared/services/server";
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

  const body = (await request.json()) as { subject?: string; bodyHtml?: string };
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const bodyHtml = typeof body.bodyHtml === "string" ? body.bodyHtml : "";

  if (!subject) {
    return createErrorResponse("Укажите тему письма", 400);
  }

  const issue = await createNewsletterIssue({ subject, bodyHtml });
  return NextResponse.json(issue, { status: 201 });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/admin/newsletter/issues");
}

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandler, request, "POST /api/admin/newsletter/issues");
}
