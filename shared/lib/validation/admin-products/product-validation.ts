/**
 * Валидация полей продуктов
 */

import { DTO } from "@/shared/services";
import type { FieldError } from "@/shared/lib/validation";
import type { BaseFieldOptions, ItemValidationContext } from "./product-types";
import {
  MAX_NAME_LENGTH,
  MAX_SLUG_LENGTH,
  MAX_SKU_LENGTH,
  MAX_PRICE_VALUE,
  ALLOWED_SIZES,
  SLUG_REGEX,
  SKU_REGEX,
} from "./product-types";
import { isNonEmptyString, isPositiveInt, getItemFieldName } from "./product-helpers";

/**
 * Валидация названия товара (name).
 */
export function validateName(
  value: unknown,
  options: BaseFieldOptions = {},
  mode: "create" | "update" = "create",
): FieldError[] {
  const { field = "name", optional = false } = options;
  const errors: FieldError[] = [];

  if (value === undefined) {
    if (optional) return errors;

    errors.push({
      field,
      message: "Название товара обязательно и не может быть пустым",
    });
    return errors;
  }

  if (!isNonEmptyString(value)) {
    errors.push({
      field,
      message:
        mode === "create"
          ? "Название товара обязательно и не может быть пустым"
          : "Название товара не может быть пустым",
    });
    return errors;
  }

  const trimmed = value.trim();

  if (trimmed.length > MAX_NAME_LENGTH) {
    errors.push({
      field,
      message: `Название товара не должно быть длиннее ${MAX_NAME_LENGTH} символов`,
    });
  }

  return errors;
}

/**
 * Валидация slug.
 */
export function validateSlug(
  value: unknown,
  mode: "create" | "update" = "create",
  options: BaseFieldOptions = {},
): FieldError[] {
  const { field = "slug" } = options;
  const errors: FieldError[] = [];

  if (value === undefined) {
    if (mode === "update") {
      return errors;
    }

    errors.push({
      field,
      message: "Slug обязателен и не может быть пустым",
    });
    return errors;
  }

  if (!isNonEmptyString(value)) {
    errors.push({
      field,
      message:
        mode === "create" ? "Slug обязателен и не может быть пустым" : "Slug не может быть пустым",
    });
    return errors;
  }

  const slug = value.trim();

  if (slug.length > MAX_SLUG_LENGTH) {
    errors.push({
      field,
      message: `Slug не должен быть длиннее ${MAX_SLUG_LENGTH} символов`,
    });
  }

  if (!SLUG_REGEX.test(slug)) {
    errors.push({
      field,
      message: "Slug должен содержать только строчные латинские буквы, цифры и дефис",
    });
  }

  if (slug !== slug.toLowerCase()) {
    errors.push({
      field,
      message: "Slug должен быть в нижнем регистре",
    });
  }

  return errors;
}

/**
 * Валидация categoryId.
 */
export function validateCategoryId(
  value: unknown,
  options: BaseFieldOptions = {},
  mode: "create" | "update" = "create",
): FieldError[] {
  const { field = "categoryId", optional = false } = options;
  const errors: FieldError[] = [];

  if (value === undefined) {
    if (optional) return errors;

    errors.push({
      field,
      message: "categoryId обязателен и должен быть положительным целым числом",
    });
    return errors;
  }

  if (!isPositiveInt(value)) {
    errors.push({
      field,
      message:
        mode === "create"
          ? "categoryId обязателен и должен быть положительным целым числом"
          : "categoryId должен быть положительным целым числом",
    });
  }

  return errors;
}

/**
 * Валидация массива строк для поля вида: images, tags
 */
export function validateStringArrayField(
  value: unknown,
  field: string,
  itemLabel: string,
): FieldError[] {
  const errors: FieldError[] = [];

  if (value === undefined) {
    return errors;
  }

  if (!Array.isArray(value)) {
    errors.push({
      field,
      message: `${field} должен быть массивом строк`,
    });
    return errors;
  }

  value.forEach((item, idx) => {
    if (!isNonEmptyString(item)) {
      errors.push({
        field: `${field}[${idx}]`,
        message: `Каждый ${itemLabel} должен быть непустой строкой`,
      });
    }
  });

  return errors;
}

/**
 * Специализированный хелпер для валидации массива images.
 */
export function validateImages(images: unknown): FieldError[] {
  return validateStringArrayField(images, "images", "элемент images");
}

/**
 * Специализированный хелпер для валидации массива tags.
 */
export function validateTags(tags: unknown): FieldError[] {
  return validateStringArrayField(tags, "tags", "тег");
}

/**
 * Валидация поля color одного варианта товара.
 */
export function validateItemColor(
  item: DTO.ProductItemInputDto,
  ctx: ItemValidationContext,
): FieldError[] {
  const errors: FieldError[] = [];

  if (!isNonEmptyString(item.color)) {
    errors.push({
      field: getItemFieldName(ctx, "color"),
      message: "Цвет (color) обязателен и не может быть пустым",
    });
  }

  return errors;
}

/**
 * Валидация поля size одного варианта товара.
 */
export function validateItemSize(
  item: DTO.ProductItemInputDto,
  ctx: ItemValidationContext,
): FieldError[] {
  const errors: FieldError[] = [];
  const field = getItemFieldName(ctx, "size");

  if (!item.size) {
    errors.push({
      field,
      message: "Размер (size) обязателен",
    });
  } else if (!ALLOWED_SIZES.includes(item.size)) {
    errors.push({
      field,
      message: `Недопустимое значение размера. Разрешено: ${ALLOWED_SIZES.join(", ")}`,
    });
  }

  return errors;
}

/**
 * Валидация поля price одного варианта товара.
 */
export function validateItemPrice(
  item: DTO.ProductItemInputDto,
  ctx: ItemValidationContext,
): FieldError[] {
  const errors: FieldError[] = [];
  const field = getItemFieldName(ctx, "price");

  if (!isPositiveInt(item.price)) {
    errors.push({
      field,
      message: "Цена (price) должна быть положительным целым числом (в копейках)",
    });
  } else if (item.price > MAX_PRICE_VALUE) {
    errors.push({
      field,
      message: "Цена (price) выглядит слишком большой. Проверь, нет ли лишних нулей",
    });
  }

  return errors;
}

/**
 * Валидация массива imageUrls одного варианта товара.
 */
export function validateItemImageUrls(
  item: DTO.ProductItemInputDto,
  ctx: ItemValidationContext,
): FieldError[] {
  const errors: FieldError[] = [];
  const field = getItemFieldName(ctx, "imageUrls");

  if (item.imageUrls === undefined) {
    return errors;
  }

  if (!Array.isArray(item.imageUrls)) {
    errors.push({
      field,
      message: "imageUrls должен быть массивом строк",
    });
    return errors;
  }

  item.imageUrls.forEach((url, urlIndex) => {
    if (!isNonEmptyString(url)) {
      errors.push({
        field: `${field}[${urlIndex}]`,
        message: "Каждый imageUrl должен быть непустой строкой",
      });
    }
  });

  return errors;
}

/**
 * Валидация SKU одного варианта товара.
 */
export function validateItemSku(
  item: DTO.ProductItemInputDto,
  ctx: ItemValidationContext,
): FieldError[] {
  const errors: FieldError[] = [];
  const field = getItemFieldName(ctx, "sku");

  if (typeof item.sku !== "string" || item.sku.trim().length === 0) {
    return errors;
  }

  const normalizedSku = item.sku.trim();

  if (!SKU_REGEX.test(normalizedSku)) {
    errors.push({
      field,
      message: "SKU может содержать только буквы, цифры, дефис и подчёркивание",
    });
  }

  if (normalizedSku.length > MAX_SKU_LENGTH) {
    errors.push({
      field,
      message: `SKU не должен быть длиннее ${MAX_SKU_LENGTH} символов`,
    });
  }

  const skuKey = normalizedSku.toLowerCase();
  if (ctx.skuSet.has(skuKey)) {
    errors.push({
      field,
      message: "SKU должен быть уникальным внутри списка вариантов товара",
    });
  } else {
    ctx.skuSet.add(skuKey);
  }

  return errors;
}

/**
 * Контроль уникальности комбинации color+size для одного варианта товара.
 */
export function validateItemUniqueCombo(
  item: DTO.ProductItemInputDto,
  ctx: ItemValidationContext,
): FieldError[] {
  const errors: FieldError[] = [];
  const field = getItemFieldName(ctx, "size");

  const key = `${item.color ?? ""}__${item.size ?? ""}`;

  if (ctx.combos.has(key)) {
    errors.push({
      field,
      message: "Комбинация цвет+размер должна быть уникальной для товара",
    });
  } else {
    ctx.combos.add(key);
  }

  return errors;
}

/**
 * Общая валидация массива вариантов товара (items).
 */
export function validateItems(
  items: DTO.ProductItemInputDto[] | undefined,
  options: { allowEmpty: boolean; fieldPrefix?: string },
): FieldError[] {
  const errors: FieldError[] = [];
  const { allowEmpty, fieldPrefix = "items" } = options;

  if (items === undefined) {
    return errors;
  }

  if (!Array.isArray(items)) {
    errors.push({
      field: fieldPrefix,
      message: `${fieldPrefix} должен быть массивом`,
    });
    return errors;
  }

  if (!allowEmpty && items.length === 0) {
    errors.push({
      field: fieldPrefix,
      message: "Список вариантов товара (items) не может быть пустым",
    });
    return errors;
  }

  const combos = new Set<string>();
  const skuSet = new Set<string>();

  items.forEach((item, index) => {
    const ctx: ItemValidationContext = {
      prefix: `${fieldPrefix}[${index}]`,
      combos,
      skuSet,
    };

    errors.push(...validateItemColor(item, ctx));
    errors.push(...validateItemSize(item, ctx));
    errors.push(...validateItemPrice(item, ctx));
    errors.push(...validateItemImageUrls(item, ctx));
    errors.push(...validateItemSku(item, ctx));
    errors.push(...validateItemUniqueCombo(item, ctx));
  });

  return errors;
}
