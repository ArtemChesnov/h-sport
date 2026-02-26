import { PaginationMetaDto, PromoTypeDto } from "../base.dto";

/**
 * Промокод (админка).
 *
 * Важно: value хранится как Int в Prisma.
 * - для PERCENT: 1..100
 * - для AMOUNT: сумма в копейках
 */
export type AdminPromoCodeDto = {
  id: number;
  code: string;
  type: PromoTypeDto;
  value: number;

  startsAt: string | null; // ISO
  endsAt: string | null; // ISO

  minOrder: number | null; // копейки
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;

  createdAt: string; // ISO
  updatedAt: string; // ISO
};

/**
 * Query-параметры для списка промокодов (админка).
 *
 * GET /api/(admin)/promos
 */
export type AdminPromoCodesQueryDto = {
  page?: number;
  perPage?: number;

  /** Фильтр по подстроке кода (case-insensitive). */
  code?: string;

  /** true/false. Если не передать — без фильтра. */
  isActive?: boolean;
};

/**
 * Ответ списка промокодов.
 */
export type AdminPromoCodesListResponseDto = {
  items: AdminPromoCodeDto[];
  meta: PaginationMetaDto;
};

/**
 * Создание промокода.
 *
 * POST /api/(admin)/promos
 */
export type AdminPromoCodeCreateDto = {
  code: string;
  type: PromoTypeDto;
  value: number;

  startsAt?: string | null; // ISO
  endsAt?: string | null; // ISO
  minOrder?: number | null;
  usageLimit?: number | null;
  isActive?: boolean;
};

/**
 * Обновление промокода.
 *
 * PATCH /api/(admin)/promos/:id
 */
export type AdminPromoCodeUpdateDto = Partial<AdminPromoCodeCreateDto>;
