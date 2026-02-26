import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getCountrySuggestions } from "@/modules/shipping/lib/geocoding/dadata";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const qRaw = searchParams.get("q");

  if (!qRaw) {
    return NextResponse.json(
      { message: "Query parameter 'q' is required" },
      { status: 400 },
    );
  }

  const q = qRaw.length > 200 ? qRaw.slice(0, 200) : qRaw;
  const suggestions = await getCountrySuggestions(q);

  return NextResponse.json({ suggestions });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/shipping/suggestions/country");
}
