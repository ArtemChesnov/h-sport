import {
  getAbandonedCartsAnalysis,
  getLTVMetrics,
  getProductVariantsStats,
  getPromoEffectiveness,
} from "@/modules/metrics/lib/business-metrics";
import { METRICS_CACHE_TTL_MS } from "@/shared/constants";
import { CACHE_CONTROL_BUSINESS_METRICS } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { getAsync, set } from "@/shared/lib/cache";
import { periodToDays } from "@/shared/lib/period-converter";
import { DTO } from "@/shared/services";
import type { BusinessMetricsResponse } from "@/shared/services";
import type { ErrorResponse } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Парсит период с валидацией
 */
function parsePeriod(raw: string | null): DTO.AdminDashboardPeriodDto {
  const allowed: DTO.AdminDashboardPeriodDto[] = ["7d", "30d", "90d"];
  if (!raw) return "30d";
  if (allowed.includes(raw as DTO.AdminDashboardPeriodDto)) {
    return raw as DTO.AdminDashboardPeriodDto;
  }
  return "30d";
}

/**
 * GET /api/admin/business-metrics
 *
 * Возвращает уникальные бизнес-метрики для админки:
 * 1. Детальный анализ брошенных корзин
 * 2. LTV и повторные покупки
 * 3. Эффективность промокодов (ROI)
 * 4. Статистика по размерам/цветам товаров
 *
 * Использует кеширование (Redis + in-memory) на 5 минут для снижения нагрузки на БД
 */
async function getHandler(
  req: NextRequest,
): Promise<NextResponse<BusinessMetricsResponse>> {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(req);
  if (authError) return authError as NextResponse<BusinessMetricsResponse>;

  const { searchParams } = new URL(req.url);
  const rawPeriod = searchParams.get("period");
  const period = parsePeriod(rawPeriod);
  const days = periodToDays(period);

  const cacheKey = `business-metrics:${period}`;
  const cached = await getAsync<BusinessMetricsResponse>(cacheKey);
  if (cached) {
    return NextResponse.json<BusinessMetricsResponse>(cached, {
      headers: { "X-Cache": "HIT", "Cache-Control": CACHE_CONTROL_BUSINESS_METRICS },
    });
  }

  const now = new Date();
  const [abandonedCartsAnalysis, ltvMetrics, promoCodesMetrics, productVariants] = await Promise.all([
    getAbandonedCartsAnalysis(days),
    getLTVMetrics(days),
    getPromoEffectiveness(days),
    getProductVariantsStats(days),
  ]);

  const from = new Date();
  from.setDate(now.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  const response: BusinessMetricsResponse = {
    period,
    from: from.toISOString(),
    to: now.toISOString(),
    abandonedCarts: {
      total: abandonedCartsAnalysis.total,
      totalValue: abandonedCartsAnalysis.totalValue,
      averageValue: abandonedCartsAnalysis.averageValue,
      withPromoCode: abandonedCartsAnalysis.withPromoCode,
      topProducts: abandonedCartsAnalysis.topProducts,
      byHour: abandonedCartsAnalysis.byHour,
      abandonmentRate: abandonedCartsAnalysis.abandonmentRate,
    },
    ltv: ltvMetrics,
    promoCodes: promoCodesMetrics,
    productVariants,
  };

  set(cacheKey, response, METRICS_CACHE_TTL_MS);
  return NextResponse.json<BusinessMetricsResponse>(response, {
    headers: { "X-Cache": "MISS", "Cache-Control": CACHE_CONTROL_BUSINESS_METRICS },
  });
}

export async function GET(
  req: NextRequest,
): Promise<NextResponse<BusinessMetricsResponse | ErrorResponse>> {
  return withErrorHandling(getHandler, req, "GET /api/admin/business-metrics");
}
