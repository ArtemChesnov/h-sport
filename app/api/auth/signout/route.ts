/**
 * POST /api/auth/signout
 * Выход пользователя
 */

import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { deleteSessionCookie } from "@/shared/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Rate limiting: 100 запросов в минуту (мягкий лимит)
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const response = NextResponse.json({ success: true });
  deleteSessionCookie(response);
  return response;
}
