/**
 * Утилиты для пагинации
 */

import type * as DTO from "@/shared/services/dto";
import { DEFAULT_PER_PAGE, MAX_PER_PAGE, ADMIN_MAX_PER_PAGE } from "@/shared/constants";

/**
 * Нормализует параметры пагинации из query-параметров
 * @param rawPage - сырое значение page из query
 * @param rawPerPage - сырое значение perPage из query
 * @param maxPerPage - максимальное значение perPage (по умолчанию MAX_PER_PAGE)
 * @param defaultPerPage - значение по умолчанию (по умолчанию DEFAULT_PER_PAGE)
 * @returns Нормализованные значения page и perPage
 */
export function normalizePaginationParams(
  rawPage: string | null | undefined,
  rawPerPage: string | null | undefined,
  maxPerPage: number = MAX_PER_PAGE,
  defaultPerPage: number = DEFAULT_PER_PAGE
): { page: number; perPage: number } {
  const pageFromQuery = parseInt(rawPage ?? "1", 10);
  const page = Math.max(pageFromQuery || 1, 1);

  const perPageFromQuery = parseInt(rawPerPage ?? String(defaultPerPage), 10);
  const perPage = Math.min(Math.max(perPageFromQuery || defaultPerPage, 1), maxPerPage);

  return { page, perPage };
}

/**
 * Нормализует параметры пагинации для админки
 */
export function normalizeAdminPaginationParams(
  rawPage: string | null | undefined,
  rawPerPage: string | null | undefined
): { page: number; perPage: number } {
  return normalizePaginationParams(rawPage, rawPerPage, ADMIN_MAX_PER_PAGE, DEFAULT_PER_PAGE);
}

/**
 * Вычисляет skip для Prisma запросов
 */
export function calculateSkip(page: number, perPage: number): number {
  return (page - 1) * perPage;
}

/**
 * Вычисляет общее количество страниц
 */
export function calculateTotalPages(total: number, perPage: number): number {
  return Math.max(Math.ceil(total / perPage), 1);
}

/**
 * Строит объект метаданных пагинации
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  perPage: number
): DTO.PaginationMetaDto {
  const pages = calculateTotalPages(total, perPage);
  // Ограничиваем page максимальным значением pages
  const safePage = Math.min(page, pages);

  return {
    page: safePage,
    perPage,
    total,
    pages,
    hasNext: safePage < pages,
    hasPrev: safePage > 1,
  };
}

/**
 * Строит ответ с пагинацией
 */
export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number
): {
  items: T[];
  meta: DTO.PaginationMetaDto;
} {
  return {
    items,
    meta: buildPaginationMeta(total, page, perPage),
  };
}
