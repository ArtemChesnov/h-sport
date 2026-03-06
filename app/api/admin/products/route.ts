import { buildPaginatedResponse, normalizeAdminPaginationParams } from "@/shared/lib/pagination";
import { validateSearchQuery, validateSlugQuery } from "@/shared/lib/validation";
import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import {
  createErrorResponse,
  createValidationErrorResponse,
} from "@/shared/lib/api/error-response";
import { mapToAdminListItemDto } from "@/shared/lib/products/admin/mappers";
import { parseAvailability, parseSort } from "@/shared/lib/products/admin/parsers";
import { validateProductCreate } from "@/shared/lib/validation/admin-products";
import { DTO } from "@/shared/services";
import {
  createProduct,
  getAdminProductsList,
  normalizeProductPayload,
  cleanupOrphanProductImages,
} from "@/shared/services/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/(admin)/products
 * Список товаров с фильтрацией и сортировкой.
 */
async function getHandler(request: NextRequest) {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const sp = new URL(request.url).searchParams;
  const { page, perPage } = normalizeAdminPaginationParams(sp.get("page"), sp.get("perPage"));
  const categoryIdRaw = sp.get("categoryId")?.trim() || null;
  const categoryId =
    categoryIdRaw && Number.isFinite(Number(categoryIdRaw)) ? Number(categoryIdRaw) : undefined;

  const { products, total } = await getAdminProductsList({
    q: validateSearchQuery(sp.get("q")) ?? undefined,
    categorySlug: validateSlugQuery(sp.get("categorySlug")),
    categoryId,
    sort: parseSort(sp.get("sort")),
    availability: parseAvailability(sp.get("availability")),
    page,
    perPage,
  });
  const listItems = products.map(mapToAdminListItemDto);
  return NextResponse.json(buildPaginatedResponse(listItems, total, page, perPage));
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/admin/products");
}

/**
 * POST /api/(admin)/products
 * Создание товара + вариантов.
 */
async function postHandler(request: NextRequest) {
  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const sizeCheck = validateRequestSize(request, 5 * 1024 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response;

  const raw = (await request.json()) as DTO.ProductCreateDto;
  const payload = normalizeProductPayload(raw);
  const errors = validateProductCreate(payload);
  if (errors.length > 0) {
    return createValidationErrorResponse("Ошибка валидации", errors, 400);
  }

  const result = await createProduct(payload);
  if (!result.ok) {
    return createErrorResponse(result.message, result.status);
  }

  await cleanupOrphanProductImages(process.cwd());

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/", "layout");
  revalidatePath("/catalog", "page");

  const { invalidateCatalogList, invalidateProductBundles } = await import("@/shared/lib/cache");
  invalidateCatalogList();
  invalidateProductBundles();

  return NextResponse.json(result.product, { status: 201 });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandler, request, "POST /api/admin/products");
}
