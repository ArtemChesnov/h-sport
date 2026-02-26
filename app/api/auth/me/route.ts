/**
 * GET /api/auth/me
 * Получение текущего пользователя
 */

import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getSessionUserFromRequest, type SessionUser } from "@/shared/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

export const GET = withMetricsAuto(async (request: NextRequest): Promise<NextResponse<{ success: boolean; message: string } | { success: boolean; user: SessionUser }>> => {
  // Rate limiting: 100 запросов в минуту
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Не авторизован" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    user,
  });
});
