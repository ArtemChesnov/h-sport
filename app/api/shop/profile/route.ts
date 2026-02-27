import { userProfileUpdateSchema } from "@/shared/lib/api/request-body-schemas";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { validateRequestBody } from "@/shared/lib/api/validate-request-body";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { getSessionUserOrError } from "@/shared/lib/auth/middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { DTO } from "@/shared/services";
import { getUserProfile, updateUserProfile } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

const getHandlerWithMetrics = withMetricsAuto(
  async (request: NextRequest): Promise<NextResponse<DTO.UserProfileDto | ErrorResponse>> => {
    const rateLimitResponse = await applyRateLimit(request, "profile");
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionUserOrError(request);
    if ("error" in session) return session.error;

    const result = await getUserProfile(session.user.id);

    if (!result.ok) {
      return createErrorResponse(result.message, result.status);
    }

    return NextResponse.json<DTO.UserProfileDto>(result.profile, { status: 200 });
  }
);

const patchHandlerWithMetrics = withMetricsAuto(
  async (request: NextRequest): Promise<NextResponse<DTO.UserProfileDto | ErrorResponse>> => {
    const rateLimitResponse = await applyRateLimit(request, "profile");
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionUserOrError(request);
    if ("error" in session) return session.error;

    const bodyResult = await validateRequestBody(request, userProfileUpdateSchema);
    if ("error" in bodyResult) return bodyResult.error;
    const body = bodyResult.data as DTO.UserProfileUpdateDto;

    const result = await updateUserProfile(session.user.id, body);

    if (!result.ok) {
      return createErrorResponse(result.message, result.status);
    }

    return NextResponse.json<DTO.UserProfileDto>(result.profile, { status: 200 });
  }
);

export async function GET(
  request: NextRequest
): Promise<NextResponse<DTO.UserProfileDto | ErrorResponse>> {
  return withErrorHandling(getHandlerWithMetrics, request, "GET /api/shop/profile");
}

export async function PATCH(
  request: NextRequest
): Promise<NextResponse<DTO.UserProfileDto | ErrorResponse>> {
  return withErrorHandling(patchHandlerWithMetrics, request, "PATCH /api/shop/profile");
}
