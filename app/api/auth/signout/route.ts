/**
 * POST /api/auth/signout
 * Выход пользователя
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { deleteSessionCookie } from "@/shared/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const response = NextResponse.json({ success: true });
  deleteSessionCookie(response);
  return response;
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handler, request, "POST /api/auth/signout");
}
