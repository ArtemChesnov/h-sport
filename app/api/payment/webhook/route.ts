/**
 * POST /api/payment/webhook
 * Обработка webhook от Robokassa (Result URL)
 */

import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { getAppUrl } from "@/shared/lib/config/env";
import { recordSecurityEvent, recordWebhookLog } from "@/shared/lib/security-log";
import { parseWebhookFormData, processRobokassaWebhook } from "@/shared/services/server";
import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_MAX_BODY = 64 * 1024; // 64KB — достаточно для formData от Robokassa

async function handler(request: NextRequest) {
  const sizeCheck = validateRequestSize(request, WEBHOOK_MAX_BODY);
  if (!sizeCheck.valid) return sizeCheck.response;

  const body = await request.formData();
  const data = parseWebhookFormData(body);

  if (!data) {
    return createErrorResponse("Недостаточно данных", 400);
  }

  const baseUrl = getAppUrl();

  const result = await processRobokassaWebhook(data, baseUrl);

  const invId = result.ok ? result.invId : data.InvId;

  if (result.ok) {
    recordWebhookLog({
      source: "robokassa",
      request,
      invId,
      result: result.replay ? "REPLAY" : "SUCCESS",
    }).catch(() => {});
  } else {
    recordWebhookLog({
      source: "robokassa",
      request,
      invId,
      result: "ERROR",
      message: result.message,
    }).catch(() => {});
    if (result.message === "Неверная подпись") {
      recordSecurityEvent({
        type: "INVALID_PAYMENT_SIGNATURE",
        request,
        details: { invId: data.InvId },
      }).catch(() => {});
    }
  }

  if (!result.ok) {
    return createErrorResponse(result.message, result.status);
  }

  return new NextResponse(`OK${result.invId}`, { status: 200 });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/payment/webhook");
}
