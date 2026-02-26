import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import {
  exportMetricsCSV,
  parseMetricType,
  parsePeriodDays,
} from "@/shared/services/server/metrics/metrics-route.service";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest): Promise<NextResponse> {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const sp = new URL(request.url).searchParams;
  const type = parseMetricType(sp.get("type"));
  const days = parsePeriodDays(sp.get("days"));

  const { csv, filename } = await exportMetricsCSV(type, days);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withErrorHandling(getHandler, request, "GET /api/admin/metrics/export");
}
