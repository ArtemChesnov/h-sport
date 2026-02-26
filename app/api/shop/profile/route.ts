import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { DTO } from "@/shared/services";
import { getUserProfile, updateUserProfile } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

const getHandlerWithMetrics = withMetricsAuto(async (
  request: NextRequest,
): Promise<NextResponse<DTO.UserProfileDto | ErrorResponse>> => {
  const rateLimitResponse = await applyRateLimit(request, "profile");
  if (rateLimitResponse) return rateLimitResponse;

  const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return createErrorResponse("Требуется авторизация", 401);
  }

  const result = await getUserProfile(user.id);

  if (!result.ok) {
    return createErrorResponse(result.message, result.status);
  }

  return NextResponse.json<DTO.UserProfileDto>(result.profile, { status: 200 });
});

const patchHandlerWithMetrics = withMetricsAuto(async (
  request: NextRequest,
): Promise<NextResponse<DTO.UserProfileDto | ErrorResponse>> => {
  const rateLimitResponse = await applyRateLimit(request, "profile");
  if (rateLimitResponse) return rateLimitResponse;

  const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return createErrorResponse("Требуется авторизация", 401);
  }

  let body: DTO.UserProfileUpdateDto;
  try {
    body = (await request.json()) as DTO.UserProfileUpdateDto;
  } catch {
    return createErrorResponse("Некорректное тело запроса", 400);
  }

  const result = await updateUserProfile(user.id, body);

  if (!result.ok) {
    return createErrorResponse(result.message, result.status);
  }

  return NextResponse.json<DTO.UserProfileDto>(result.profile, { status: 200 });
});

export async function GET(
  request: NextRequest,
): Promise<NextResponse<DTO.UserProfileDto | ErrorResponse>> {
  return withErrorHandling(getHandlerWithMetrics, request, "GET /api/shop/profile");
}

export async function PATCH(
  request: NextRequest,
): Promise<NextResponse<DTO.UserProfileDto | ErrorResponse>> {
  return withErrorHandling(patchHandlerWithMetrics, request, "PATCH /api/shop/profile");
}
