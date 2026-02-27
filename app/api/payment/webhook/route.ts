/**
 * POST /api/payment/webhook
 * Обработка webhook от Robokassa (Result URL)
 */

import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { getAppUrl } from "@/shared/lib/config/env";
import { parseWebhookFormData, processRobokassaWebhook } from "@/shared/services/server";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const body = await request.formData();
  const data = parseWebhookFormData(body);

  if (!data) {
    return createErrorResponse("Недостаточно данных", 400);
  }

  const baseUrl = getAppUrl();

  const result = await processRobokassaWebhook(data, baseUrl);

  if (!result.ok) {
    return createErrorResponse(result.message, result.status);
  }

  return new NextResponse(`OK${result.invId}`, { status: 200 });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/payment/webhook");
}
