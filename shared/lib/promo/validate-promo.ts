/**
 * Общий модуль валидации промокодов
 * Используется в админке (создание/обновление) и витрине (применение)
 */

import type { PromoType } from "@prisma/client";

/**
 * Минимальная структура промокода для валидации
 */
export interface PromoForValidation {
  code?: string;
  type?: PromoType;
  value?: number;
  minOrder?: number | null;
  usageLimit?: number | null;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  isActive?: boolean;
  usedCount?: number;
}

/**
 * Ошибка валидации промокода
 */
export class PromoValidationError extends Error {
  field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "PromoValidationError";
    this.field = field;
  }
}

/**
 * Валидация формата кода промокода
 */
export function validatePromoCode(code: string): { valid: boolean; error?: string } {
  const trimmed = code.trim();
  if (!trimmed) {
    return { valid: false, error: "Код обязателен" };
  }

  const upperCode = trimmed.toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(upperCode)) {
    return { valid: false, error: "Код может содержать только A-Z, 0-9, _ и -" };
  }

  if (upperCode.length < 3 || upperCode.length > 32) {
    return { valid: false, error: "Код промокода должен быть 3–32 символа" };
  }

  return { valid: true };
}

/**
 * Валидация типа промокода
 */
export function validatePromoType(type: unknown): { valid: boolean; error?: string } {
  if (type !== "PERCENT" && type !== "AMOUNT") {
    return { valid: false, error: "Неверный тип промокода" };
  }
  return { valid: true };
}

/**
 * Валидация значения промокода
 */
export function validatePromoValue(
  value: number | null | undefined,
  type?: PromoType,
): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value <= 0) {
    return {
      valid: false,
      error:
        type === "AMOUNT"
          ? "Скидка в рублях должна быть больше 0"
          : "Процент скидки должен быть больше 0",
    };
  }

  if (type === "PERCENT" && (value < 1 || value > 100)) {
    return { valid: false, error: "Процент скидки должен быть от 1 до 100" };
  }

  return { valid: true };
}

/**
 * Валидация минимальной суммы заказа
 */
export function validateMinOrder(minOrder: number | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (minOrder !== null && minOrder !== undefined && minOrder < 0) {
    return { valid: false, error: "Минимальный заказ не может быть отрицательным" };
  }
  return { valid: true };
}

/**
 * Валидация лимита использований
 */
export function validateUsageLimit(usageLimit: number | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (usageLimit !== null && usageLimit !== undefined) {
    if (!Number.isInteger(usageLimit) || usageLimit <= 0) {
      return {
        valid: false,
        error: "Лимит использований должен быть целым числом > 0 или null",
      };
    }
  }
  return { valid: true };
}

/**
 * Валидация дат промокода
 */
export function validatePromoDates(
  startsAt: Date | string | null | undefined,
  endsAt: Date | string | null | undefined,
): { valid: boolean; error?: string } {
  const startsAtDate = startsAt ? new Date(startsAt) : null;
  const endsAtDate = endsAt ? new Date(endsAt) : null;

  if (startsAtDate && Number.isNaN(startsAtDate.getTime())) {
    return { valid: false, error: "Некорректная дата начала" };
  }

  if (endsAtDate && Number.isNaN(endsAtDate.getTime())) {
    return { valid: false, error: "Некорректная дата окончания" };
  }

  if (startsAtDate && endsAtDate && startsAtDate > endsAtDate) {
    return { valid: false, error: "Дата начала не может быть позже даты окончания" };
  }

  return { valid: true };
}

/**
 * Проверка активности промокода (даты и флаг isActive)
 */
export function validatePromoActive(
  promo: {
    isActive?: boolean;
    startsAt?: Date | string | null;
    endsAt?: Date | string | null;
  },
  now: Date = new Date(),
): { valid: boolean; error?: string; field?: string } {
  if (promo.isActive === false) {
    return { valid: false, error: "Промокод отключён", field: "code" };
  }

  const startsAtDate = promo.startsAt ? new Date(promo.startsAt) : null;
  const endsAtDate = promo.endsAt ? new Date(promo.endsAt) : null;

  if (startsAtDate && startsAtDate > now) {
    return { valid: false, error: "Промокод ещё не активен", field: "code" };
  }

  if (endsAtDate && endsAtDate < now) {
    return { valid: false, error: "Срок действия промокода истёк", field: "code" };
  }

  return { valid: true };
}

/**
 * Валидация применения промокода к корзине (для витрины)
 * Проверяет: даты, минимальную сумму, лимиты использования
 */
export function validatePromoForSubtotal(
  promo: {
    code: string;
    startsAt?: Date | string | null;
    endsAt?: Date | string | null;
    minOrder?: number | null;
    usageLimit?: number | null;
    usedCount?: number;
  },
  subtotal: number,
  now: Date = new Date(),
): void {
  // 1. Проверка активности (даты)
  const activeCheck = validatePromoActive(promo, now);
  if (!activeCheck.valid) {
    throw new PromoValidationError(activeCheck.error || "Промокод не активен", activeCheck.field);
  }

  // 2. Минимальная сумма заказа
  if (promo.minOrder != null && subtotal < promo.minOrder) {
    const minRub = promo.minOrder / 100;
    throw new PromoValidationError(
      `Минимальная сумма заказа для промокода ${promo.code} — ${minRub.toLocaleString("ru-RU", {
        maximumFractionDigits: 0,
      })} ₽.`,
      "_global",
    );
  }

  // 3. Глобальный лимит использований
  if (promo.usageLimit != null && (promo.usedCount ?? 0) >= promo.usageLimit) {
    throw new PromoValidationError(
      "Лимит использований этого промокода уже исчерпан.",
      "_global",
    );
  }
}

/**
 * Валидация всех полей промокода при создании/обновлении (для админки)
 */
export function validatePromoFields(promo: PromoForValidation): {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const errors: Array<{ field: string; message: string }> = [];

  // Валидация кода
  if (promo.code !== undefined) {
    const codeCheck = validatePromoCode(promo.code);
    if (!codeCheck.valid) {
      errors.push({ field: "code", message: codeCheck.error || "Некорректный код" });
    }
  }

  // Валидация типа
  if (promo.type !== undefined) {
    const typeCheck = validatePromoType(promo.type);
    if (!typeCheck.valid) {
      errors.push({ field: "type", message: typeCheck.error || "Некорректный тип" });
    }
  }

  // Валидация значения
  if (promo.value !== undefined) {
    const valueCheck = validatePromoValue(promo.value, promo.type);
    if (!valueCheck.valid) {
      errors.push({ field: "value", message: valueCheck.error || "Некорректное значение" });
    }
  }

  // Валидация минимальной суммы
  if (promo.minOrder !== undefined) {
    const minOrderCheck = validateMinOrder(promo.minOrder);
    if (!minOrderCheck.valid) {
      errors.push({ field: "minOrder", message: minOrderCheck.error || "Некорректная сумма" });
    }
  }

  // Валидация лимита использований
  if (promo.usageLimit !== undefined) {
    const limitCheck = validateUsageLimit(promo.usageLimit);
    if (!limitCheck.valid) {
      errors.push({
        field: "usageLimit",
        message: limitCheck.error || "Некорректный лимит",
      });
    }
  }

  // Валидация дат
  if (promo.startsAt !== undefined || promo.endsAt !== undefined) {
    const datesCheck = validatePromoDates(promo.startsAt, promo.endsAt);
    if (!datesCheck.valid) {
      errors.push({ field: "_global", message: datesCheck.error || "Некорректные даты" });
    }
  }

  // Валидация isActive (должно быть boolean, если передано)
  if (promo.isActive !== undefined && typeof promo.isActive !== "boolean") {
    errors.push({
      field: "isActive",
      message: "Поле активности промокода (isActive) обязательно",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
