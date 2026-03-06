import { createErrorResponse } from "@/shared/lib/api/error-response";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { DTO } from "@/shared/services";
import {
  deleteAdminProduct,
  getAdminProductBySlug,
  updateAdminProduct,
  cleanupOrphanProductImages,
} from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ slug: string }>;

/**
 * Простая runtime-валидация DTO.ProductUpdateDto.
 * Если всё ок — вернёт null, иначе текст ошибки.
 */
function validateProductUpdateDto(dto: DTO.ProductUpdateDto): string | null {
  if (!dto.name || !dto.name.trim()) {
    return "Название товара обязательно";
  }

  if (!dto.categoryId || dto.categoryId <= 0) {
    return "Категория товара обязательна";
  }

  if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
    return "Нужно указать хотя бы один вариант товара";
  }

  for (const [index, item] of dto.items.entries()) {
    const humanIndex = index + 1;

    if (!item.color || !item.color.trim()) {
      return `Цвет обязателен для варианта №${humanIndex}`;
    }

    if (!item.size) {
      return `Размер обязателен для варианта №${humanIndex}`;
    }

    if (typeof item.price !== "number" || !Number.isFinite(item.price) || item.price <= 0) {
      return `Цена должна быть больше 0 для варианта №${humanIndex}`;
    }
  }

  return null;
}

/**
 * GET /api/(admin)/products/[slug]
 *
 * Детальная информация о товаре для формы редактирования в админке.
 * Возвращает DTO.ProductDetailDto.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<DTO.ProductDetailDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<DTO.ProductDetailDto>;

      const { slug } = await context.params;
      const dto = await getAdminProductBySlug(slug);
      if (!dto) return createErrorResponse("Товар не найден", 404);
      return NextResponse.json<DTO.ProductDetailDto>(dto, { status: 200 });
    },
    _request,
    "GET /api/admin/products/[slug]"
  );
}

/**
 * PATCH /api/(admin)/products/[slug]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError;

      const { slug } = await context.params;
      const body = (await req.json()) as DTO.ProductUpdateDto;
      const validationError = validateProductUpdateDto(body);
      if (validationError) return createErrorResponse(validationError, 400);

      const result = await updateAdminProduct(slug, body, {
        basePath: process.cwd(),
      });
      if (!result) return createErrorResponse("Товар не найден", 404);

      await cleanupOrphanProductImages(process.cwd());

      const { revalidatePath } = await import("next/cache");
      revalidatePath("/", "layout");
      revalidatePath("/catalog", "page");
      revalidatePath("/admin/products", "page");
      revalidatePath(`/product/${result.slug}`, "page");
      if (slug !== result.slug) revalidatePath(`/product/${slug}`, "page");

      const { invalidateProduct, invalidateCatalogList, invalidateProductBundles } =
        await import("@/shared/lib/cache");
      invalidateProduct(result.slug);
      if (slug !== result.slug) invalidateProduct(slug);
      invalidateCatalogList();
      invalidateProductBundles();

      return NextResponse.json(result, { status: 200 });
    },
    request,
    "PATCH /api/admin/products/[slug]"
  );
}

/**
 * DELETE /api/(admin)/products/[slug]
 *
 * Полное удаление товара и всех его вариантов.
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse<{ success: true } | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<ErrorResponse>;

      const { slug } = await context.params;
      const deleted = await deleteAdminProduct(slug, {
        basePath: process.cwd(),
      });
      if (!deleted) return createErrorResponse("Товар не найден", 404);

      await cleanupOrphanProductImages(process.cwd());

      const { revalidatePath } = await import("next/cache");
      revalidatePath("/", "layout");
      revalidatePath("/catalog", "page");
      revalidatePath("/admin/products", "page");
      revalidatePath(`/product/${slug}`, "page");

      const { invalidateProduct, invalidateCatalogList, invalidateProductBundles } =
        await import("@/shared/lib/cache");
      invalidateProduct(slug);
      invalidateCatalogList();
      invalidateProductBundles();

      return NextResponse.json<{ success: true }>({ success: true }, { status: 200 });
    },
    _request,
    "DELETE /api/admin/products/[slug]"
  );
}
