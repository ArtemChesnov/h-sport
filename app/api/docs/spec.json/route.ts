import { CACHE_CONTROL_API_DOCS } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getOpenAPISpec } from "@/shared/lib/openapi";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const spec = getOpenAPISpec();

  return NextResponse.json(spec, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": CACHE_CONTROL_API_DOCS,
    },
  });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/docs/spec.json");
}
