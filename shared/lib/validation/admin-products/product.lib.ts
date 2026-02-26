/**
 * Фасад для валидации продуктов (admin)
 *
 * Модули:
 * - product-types.ts - типы и константы
 * - product-helpers.ts - вспомогательные функции
 * - product-validation.ts - функции валидации полей
 *
 * Экспортирует публичные функции validateProductCreate и validateProductUpdate.
 */

import type { FieldError } from "@/shared/lib/validation";
import { DTO } from "@/shared/services";
import {
    validateCategoryId,
    validateImages,
    validateItems,
    validateName,
    validateSlug,
    validateTags,
} from "./product-validation";

/**
 * Валидация DTO для СОЗДАНИЯ товара (ProductCreateDto).
 */
export function validateProductCreate(body: DTO.ProductCreateDto): FieldError[] {
  const errors: FieldError[] = [];

  errors.push(...validateName(body.name, {}, "create"));
  errors.push(...validateSlug(body.slug, "create"));
  errors.push(...validateCategoryId(body.categoryId, {}, "create"));
  errors.push(...validateImages(body.images));
  errors.push(...validateTags(body.tags));
  errors.push(
    ...validateItems(body.items, {
      allowEmpty: false,
      fieldPrefix: "items",
    })
  );

  return errors;
}

/**
 * Валидация DTO для ОБНОВЛЕНИЯ товара (ProductUpdateDto).
 */
export function validateProductUpdate(body: DTO.ProductUpdateDto): FieldError[] {
  const errors: FieldError[] = [];

  if (body.name !== undefined) {
    errors.push(...validateName(body.name, { optional: true }, "update"));
  }
  if (body.slug !== undefined) {
    errors.push(...validateSlug(body.slug, "update"));
  }
  if (body.categoryId !== undefined) {
    errors.push(...validateCategoryId(body.categoryId, { optional: true }, "update"));
  }
  if (body.images !== undefined) {
    errors.push(...validateImages(body.images));
  }
  if (body.tags !== undefined) {
    errors.push(...validateTags(body.tags));
  }
  if (body.items !== undefined) {
    errors.push(
      ...validateItems(body.items, {
        allowEmpty: false,
        fieldPrefix: "items",
      })
    );
  }

  return errors;
}
