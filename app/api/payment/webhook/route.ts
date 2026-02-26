/**
 * POST /api/payment/webhook
 * Обработка webhook от Robokassa (Result URL)
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { parseWebhookFormData, processRobokassaWebhook } from "@/shared/services/server";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const body = await request.formData();
  const data = parseWebhookFormData(body);

  if (!data) {
    return NextResponse.json({ success: false, message: "Недостаточно данных" }, { status: 400 });
  }

  const baseUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await processRobokassaWebhook(data, baseUrl);

  if (!result.ok) {
    return NextResponse.json({ success: false, message: result.message }, { status: result.status });
  }

  return new NextResponse(`OK${result.invId}`, { status: 200 });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/payment/webhook");
}
