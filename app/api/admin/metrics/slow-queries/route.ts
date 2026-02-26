/**
 * GET /api/admin/metrics/slow-queries
 * Получить медленные запросы к БД. Только для администраторов.
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { normalizeAdminPaginationParams } from "@/shared/lib/pagination";
import { getSlowQueriesPage } from "@/shared/services/server/metrics/metrics-route.service";
import { NextRequest, NextResponse } from "next/server";

function parsePeriod(raw: string | null): number {
  if (!raw) return 7;
  const days = parseInt(raw, 10);
  if (!Number.isFinite(days) || days < 1 || days > 30) return 7;
  return days;
}

function parseMinDuration(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const duration = parseInt(raw, 10);
  if (!Number.isFinite(duration) || duration < 0) return undefined;
  return duration;
}

async function getHandler(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const { page, perPage } = normalizeAdminPaginationParams(
    searchParams.get("page"),
    searchParams.get("perPage"),
  );
  const periodDays = parsePeriod(searchParams.get("period"));
  const minDuration = parseMinDuration(searchParams.get("minDuration"));
  const endpoint = searchParams.get("endpoint")?.trim() || undefined;

  const response = await getSlowQueriesPage({
    page,
    perPage,
    periodDays,
    minDuration,
    endpoint,
  });
  return NextResponse.json(response, { status: 200 });
}

export async function GET(request: NextRequest): Promise<NextResponse<unknown>> {
  return withErrorHandling(getHandler, request, "GET /api/admin/metrics/slow-queries");
}
