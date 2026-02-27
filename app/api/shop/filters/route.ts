/**
 * API endpoint для получения фильтров каталога
 */

import { CACHE_CONTROL_FILTERS, CACHE_CONTROL_FILTERS_ERROR } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { logger } from "@/shared/lib/logger";
import {
  getCatalogFilters,
  type CatalogFiltersDto,
} from "@/shared/services/server/shop/filters/filters.service";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shop/filters
 *
 * Возвращает доступные фильтры каталога (цвета, размеры, диапазон цен).
 * Кэширование: 30 минут (фильтры меняются редко)
 * Rate limit: 100 req/min (catalog preset)
 */
export const revalidate = 21600;

async function getHandler(
  request: NextRequest
): Promise<NextResponse<CatalogFiltersDto | ErrorResponse>> {
  const rateLimitResponse = await applyRateLimit(request, "catalog");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const filters = await getCatalogFilters();
    return NextResponse.json(filters, {
      status: 200,
      headers: {
        "Cache-Control": CACHE_CONTROL_FILTERS,
      },
    });
  } catch (error) {
    logger.error("GET /api/shop/filters: Ошибка при получении фильтров", error);
    return NextResponse.json(
      {
        colors: [],
        sizes: [],
        priceRange: { min: 0, max: 120000 },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": CACHE_CONTROL_FILTERS_ERROR,
        },
      }
    );
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/shop/filters");
}
