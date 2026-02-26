import { DTO } from "@/shared/services";
import { AdminProductFormValues, VariantFormRow } from "@/shared/services/dto";

/**
 * Нормализация строки цены из инпута в копейки.
 * "1 990" → 199000, "" → 0
 */
function priceRubToCents(priceRub: string): number {
  if (!priceRub) return 0;

  const cleaned = priceRub
    .toString()
    .replace(/\s/g, "") // "1 990" → "1990"
    .replace(",", "."); // запятая → точка

  const numeric = Number.parseFloat(cleaned);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return Math.round(numeric * 100);
}

/**
 * Маппинг одной строки варианта формы → DTO варианта товара.
 * Используем ProductItemInputDto из types/index.
 */
function mapVariantToItem(variant: VariantFormRow): DTO.ProductItemInputDto {
  return {
    color: variant.color,
    size: variant.size,
    sku: variant.sku || undefined,
    price: priceRubToCents(variant.priceRub),
    isAvailable: variant.isAvailable,
    imageUrls: variant.imageUrls,
  };
}

/**
 * Базовый payload товара, подходящий и для create, и для update.
 *
 * slug в ProductCreateDto опционален, поэтому мы храним его
 * как slug?: string и дальше уже решаем — передавать или нет.
 */
function mapFormToBasePayload(
  values: AdminProductFormValues
): Omit<DTO.ProductCreateDto, "slug"> & { slug?: string } {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    sku: values.sku || undefined,
    categoryId: values.categoryId,
    description: values.description.trim() || null,
    composition: values.composition.trim() || null,
    images: values.images,
    tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
    items: values.variants.map(mapVariantToItem),
  };
}

/**
 * form → DTO.ProductCreateDto (POST /api/(admin)/products)
 */
export function formToProductCreateDto(values: AdminProductFormValues): DTO.ProductCreateDto {
  const base = mapFormToBasePayload(values);

  return {
    categoryId: base.categoryId,
    name: base.name,
    sku: base.sku,
    // slug в DTO опционален — просто передаём как есть (string | undefined)
    slug: base.slug,
    description: base.description,
    composition: base.composition,
    images: base.images,
    tags: base.tags,
    items: base.items,
  };
}

/**
 * form → DTO.ProductUpdateDto (PATCH /api/(admin)/products/[slug])
 *
 * В ProductUpdateDto все поля опциональны, но передавать
 * их целиком (с undefined) — нормально.
 * Если захочешь делать "частичный" diff — можно будет
 * здесь отфильтровать пустые поля.
 */
export function formToProductUpdateDto(values: AdminProductFormValues): DTO.ProductUpdateDto {
  const base = mapFormToBasePayload(values);

  return {
    name: base.name,
    sku: base.sku,
    categoryId: base.categoryId,
    description: base.description,
    composition: base.composition,
    images: base.images,
    tags: base.tags,
    items: base.items,
    // если захочешь поддержать смену slug через форму:
    // slug: base.slug,
  };
}
