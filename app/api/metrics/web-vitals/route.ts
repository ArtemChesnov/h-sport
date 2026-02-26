import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { logger } from "@/shared/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const WebVitalsPayloadSchema = z.object({
  name: z.string().min(1).max(50),
  value: z.number().finite(),
  id: z.string().max(100).optional(),
  delta: z.number().finite().optional(),
  url: z.string().max(2048),
  timestamp: z.number().int().positive().optional(),
});

async function postHandler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "webVitals");
  if (rateLimitResponse) return rateLimitResponse;

  const sizeCheck = validateRequestSize(request, 10 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const rawBody = await request.json();

  const parseResult = WebVitalsPayloadSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return createErrorResponse("Некорректные данные метрики", 400);
  }

  const body = parseResult.data;

  try {
    const { addWebVitalsMetricToBuffer } = await import("@/shared/lib/metrics");
    addWebVitalsMetricToBuffer(
      body.name,
      body.value,
      body.delta ?? null,
      body.id ?? null,
      body.url,
    );
  } catch (error) {
    logger.error("Failed to import metrics-batch or save Web Vitals metric", error);
  }

  if (process.env.NODE_ENV === "development") {
    logger.debug("Web Vitals metric received", {
      name: body.name,
      value: body.value,
      id: body.id,
      delta: body.delta,
      url: body.url,
      timestamp: body.timestamp ? new Date(body.timestamp).toISOString() : undefined,
    });
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandler, request, "POST /api/metrics/web-vitals");
}
