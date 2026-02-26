/** Админка: список промокодов, создание, обновление, удаление. */

import { prisma } from "@/prisma/prisma-client";
import { validatePromoFields } from "@/shared/lib/promo/validate-promo";
import type { DTO } from "@/shared/services";
import type { Prisma, PromoCode } from "@prisma/client";

type FieldError = { field: string; message: string };

/** Результат создания промокода */
export type CreatePromoResult =
  | { ok: true; promo: DTO.AdminPromoCodeDto }
  | { ok: false; errors: FieldError[] };

/** Данные для создания промокода */
export interface CreatePromoInput {
  code?: string;
  type?: DTO.PromoTypeDto;
  value?: number;
  minOrder?: number | null;
  usageLimit?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

/**
 * Парсит число или возвращает null
 */
export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * Парсит дату или возвращает null
 */
export function toDateOrNull(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Получает список промокодов с пагинацией
 */
export async function getPromosList(filters: {
    code?: string;
    isActive?: boolean;
    page: number;
    perPage: number;
    skip: number;
  },
): Promise<{ items: DTO.AdminPromoCodeDto[]; total: number }> {
  const where: Prisma.PromoCodeWhereInput = {};

  if (filters.code) {
    where.code = { contains: filters.code, mode: "insensitive" };
  }

  if (typeof filters.isActive === "boolean") {
    where.isActive = filters.isActive;
  }

  const [total, promos] = await Promise.all([
    prisma.promoCode.count({ where }),
    prisma.promoCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filters.skip,
      take: filters.perPage,
    }),
  ]);

  // Обновляем истёкшие промокоды
  const now = new Date();
  const expiredIds: number[] = [];

  for (const promo of promos) {
    if (promo.isActive && promo.endsAt && promo.endsAt < now) {
      expiredIds.push(promo.id);
      promo.isActive = false;
    }
  }

  // Асинхронное обновление истёкших
  if (expiredIds.length > 0) {
    prisma.promoCode.updateMany({
      where: { id: { in: expiredIds } },
      data: { isActive: false },
    }).catch((err) => {
      // Логируем ошибку, но не блокируем основной поток
      console.error("[admin-promos.service] Failed to deactivate expired promos:", err);
    });
  }

  return {
    items: promos.map(mapPromoToDto),
    total,
  };
}

/**
 * Создаёт промокод
 */
export async function createPromo(input: CreatePromoInput): Promise<CreatePromoResult> {
  // Нормализация кода
  const rawCode = typeof input.code === "string" ? input.code.trim() : "";
  const code = rawCode.toUpperCase();

  // Валидация
  const validationResult = validatePromoFields({
    code: code || undefined,
    type: input.type,
    value: toNumberOrNull(input.value) ?? undefined,
    minOrder: toNumberOrNull(input.minOrder),
    usageLimit: toNumberOrNull(input.usageLimit),
    startsAt: toDateOrNull(input.startsAt ?? null),
    endsAt: toDateOrNull(input.endsAt ?? null),
    isActive: input.isActive,
  });

  if (!validationResult.valid) {
    return { ok: false, errors: validationResult.errors };
  }

  // Подготовка данных
  const valueNum = toNumberOrNull(input.value)!;
  const minOrderNum = toNumberOrNull(input.minOrder);
  const usageLimitNum = toNumberOrNull(input.usageLimit);
  const startsAtDate = toDateOrNull(input.startsAt ?? null);
  const endsAtDate = toDateOrNull(input.endsAt ?? null);

  // Автоотключение, если дата истекла
  const now = new Date();
  let finalIsActive = input.isActive as boolean;
  if (finalIsActive && endsAtDate && endsAtDate < now) {
    finalIsActive = false;
  }

  const promo = await prisma.promoCode.create({
    data: {
      code,
      type: (input.type as Prisma.PromoCodeCreateInput["type"]) ?? "PERCENT",
      value: valueNum,
      minOrder: minOrderNum,
      usageLimit: usageLimitNum,
      startsAt: startsAtDate,
      endsAt: endsAtDate,
      isActive: finalIsActive,
    },
  });

  return { ok: true, promo: mapPromoToDto(promo) };
}

/**
 * Маппинг промокода в DTO
 */
export function mapPromoToDto(promo: PromoCode): DTO.AdminPromoCodeDto {
  return {
    id: promo.id,
    code: promo.code,
    type: promo.type as DTO.PromoTypeDto,
    value: promo.value,
    minOrder: promo.minOrder,
    usageLimit: promo.usageLimit,
    usedCount: promo.usedCount,
    startsAt: promo.startsAt ? promo.startsAt.toISOString() : null,
    endsAt: promo.endsAt ? promo.endsAt.toISOString() : null,
    isActive: promo.isActive,
    createdAt: promo.createdAt.toISOString(),
    updatedAt: promo.updatedAt.toISOString(),
  };
}

/**
 * Проверяет, является ли ошибка P2002 (unique constraint)
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

/**
 * Частичное обновление промокода. Автоотключение при истёкшей дате окончания.
 */
export async function updatePromo(
  id: number,
  data: Prisma.PromoCodeUpdateInput,
): Promise<DTO.AdminPromoCodeDto> {
  const now = new Date();
  const updateData = { ...data };

  if (updateData.isActive === true && updateData.endsAt === undefined) {
    const current = await prisma.promoCode.findUnique({
      where: { id },
      select: { endsAt: true },
    });
    const finalEndsAt = current?.endsAt ?? null;
    if (finalEndsAt && finalEndsAt < now) {
      updateData.isActive = false;
    }
  }

  const updated = await prisma.promoCode.update({
    where: { id },
    data: updateData,
  });
  return mapPromoToDto(updated);
}

/**
 * Частичное обновление промокода через DTO (фасад для route).
 * Валидирует поля, строит Prisma-обновление, обрабатывает ошибку уникальности.
 */
export async function patchPromo(
  id: number,
  raw: DTO.AdminPromoCodeUpdateDto,
): Promise<
  | { ok: true; promo: DTO.AdminPromoCodeDto }
  | { ok: false; error: string; status: number }
> {
  const updateData: Prisma.PromoCodeUpdateInput = {};

  if (typeof raw.code === "string") {
    const code = raw.code.trim().toUpperCase();
    if (!code || code.length < 3 || code.length > 32) {
      return { ok: false, error: "Код промокода должен быть 3–32 символа", status: 400 };
    }
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      return { ok: false, error: "Код может содержать только A-Z, 0-9, _ и -", status: 400 };
    }
    updateData.code = code;
  }

  if (typeof raw.type !== "undefined") {
    if (raw.type !== "PERCENT" && raw.type !== "AMOUNT") {
      return { ok: false, error: "Некорректный тип промокода", status: 400 };
    }
    updateData.type = raw.type;
  }

  if (typeof raw.value !== "undefined") {
    const v = Number(raw.value);
    if (!Number.isFinite(v)) {
      return { ok: false, error: "Некорректное значение скидки", status: 400 };
    }
    updateData.value = v;
  }

  if (typeof raw.startsAt !== "undefined") {
    updateData.startsAt = parseOptionalDate(raw.startsAt);
  }
  if (typeof raw.endsAt !== "undefined") {
    updateData.endsAt = parseOptionalDate(raw.endsAt);
  }

  if (typeof raw.minOrder !== "undefined") {
    updateData.minOrder = raw.minOrder === null ? null : Number(raw.minOrder);
  }
  if (typeof raw.usageLimit !== "undefined") {
    updateData.usageLimit = raw.usageLimit === null ? null : Number(raw.usageLimit);
  }
  if (typeof raw.isActive !== "undefined") {
    updateData.isActive = Boolean(raw.isActive);
  }

  if (Object.keys(updateData).length === 0) {
    return { ok: false, error: "Нет данных для обновления", status: 400 };
  }

  try {
    const promo = await updatePromo(id, updateData);
    return { ok: true, promo };
  } catch (error: unknown) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "Такой промокод уже существует", status: 409 };
    }
    throw error;
  }
}

function parseOptionalDate(input: unknown): Date | null {
  if (input === null || typeof input === "undefined" || input === "")
    return null;
  if (typeof input !== "string") return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Удаление промокода по id.
 */
export async function deletePromo(id: number): Promise<void> {
  await prisma.promoCode.delete({ where: { id } });
}
