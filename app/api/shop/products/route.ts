import { CACHE_CONTROL_PRODUCTS } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { withMetricsAuto } from "@/shared/lib/api/metrics-middleware";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { parseProductsQuery } from "@/shared/lib/products";
import { DTO } from "@/shared/services";
import { CatalogProductsService } from "@/shared/services/server";
import { NextRequest, NextResponse } from "next/server";

/** GET /api/shop/products. Cache 15m, revalidate 43200, rate limit catalog. */
export const revalidate = 43200;

export const GET = withMetricsAuto(
  async (request: NextRequest): Promise<NextResponse<DTO.ProductsListResponseDto | { message: string }>> => {
    return withErrorHandling(
      async (req) => {
        const rateLimitResponse = await applyRateLimit(req, "catalog");
        if (rateLimitResponse) return rateLimitResponse;

        const query = parseProductsQuery(req);
        const responseBody = await CatalogProductsService.getProducts(query);
        const isCacheHit = req.headers.get("X-Cache") === "HIT";
        const cacheControl = CACHE_CONTROL_PRODUCTS;
        const xCache = isCacheHit ? "HIT" : "MISS";

        return NextResponse.json<DTO.ProductsListResponseDto>(responseBody, {
          status: 200,
          headers: { "Cache-Control": cacheControl, "X-Cache": xCache },
        });
      },
      request,
      "GET /api/shop/products",
    );
  },
);
