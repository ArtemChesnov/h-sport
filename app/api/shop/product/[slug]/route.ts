import { PRODUCT_SLUG_CACHE_TTL_MS, CACHE_CONTROL_PRODUCT_SLUG } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getAsync, set } from "@/shared/lib/cache";
import { getProductBySlug } from "@/shared/services/server/shop/product/products.service";
import { DTO } from "@/shared/services";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type ProductRouteContext = RouteParams<{ slug: string }>;

/**
 * GET /api/shop/product/[slug]
 *
 * Возвращает детальную информацию о товаре для витрины.
 * Кэширование: Redis (приоритет) + in-memory, TTL 30 минут
 * Rate limit: 120 req/min (product preset)
 */
export const revalidate = 7200;

export async function GET(
  request: NextRequest,
  context: ProductRouteContext,
): Promise<NextResponse<DTO.ProductDetailDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "product");
      if (rateLimitResponse) return rateLimitResponse;

      const { slug } = await context.params;
      if (!slug || typeof slug !== "string") {
        return createErrorResponse("Invalid product slug", 400);
      }

      const cacheKey = `product:${slug}`;
      const cached = await getAsync<DTO.ProductDetailDto>(cacheKey);
      if (cached) {
        return NextResponse.json<DTO.ProductDetailDto>(cached, {
          status: 200,
          headers: { "Cache-Control": CACHE_CONTROL_PRODUCT_SLUG, "X-Cache": "HIT" },
        });
      }

      const dto = await getProductBySlug(slug);
      if (!dto) return createErrorResponse("Product not found", 404);

      set(cacheKey, dto, PRODUCT_SLUG_CACHE_TTL_MS);

      try {
        const { getSessionUserFromRequest } = await import("@/shared/lib/auth/session");
        const user = await getSessionUserFromRequest(req);
        const { recordProductView } = await import("@/shared/lib/ecommerce-metrics");
        recordProductView(dto.id, user?.id).catch(() => {});
      } catch {
        // ignore metrics errors
      }

      return NextResponse.json<DTO.ProductDetailDto>(dto, {
        status: 200,
        headers: { "Cache-Control": CACHE_CONTROL_PRODUCT_SLUG, "X-Cache": "MISS" },
      });
    },
    request,
    "GET /api/shop/product/[slug]",
  );
}
