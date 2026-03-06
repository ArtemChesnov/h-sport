import { CACHE_CONTROL_CATEGORIES } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { DTO } from "@/shared/services";
import { CategoriesService } from "@/shared/services/server";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shop/categories
 *
 * Возвращает список категорий каталога.
 * Формат ответа: DTO.CategoriesResponseDto
 *
 * Кэширование:
 * - ISR: 7 дней (revalidate)
 * - In-memory: 7 дней
 * - HTTP: 7 дней + stale-while-revalidate 30 дней
 *
 * Rate limit: 100 req/min (catalog preset)
 */
/** Public cache 1 день */
export const revalidate = 86400;

async function getHandler(
  request: NextRequest
): Promise<NextResponse<DTO.CategoriesResponseDto> | NextResponse<ErrorResponse>> {
  const rateLimitResponse = await applyRateLimit(request, "catalog");
  if (rateLimitResponse) return rateLimitResponse;

  const response = await CategoriesService.getAll();
  return NextResponse.json<DTO.CategoriesResponseDto>(response, {
    status: 200,
    headers: { "Cache-Control": CACHE_CONTROL_CATEGORIES },
  });
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DTO.CategoriesResponseDto | ErrorResponse>> {
  return withErrorHandling(getHandler, request, "GET /api/shop/categories");
}
