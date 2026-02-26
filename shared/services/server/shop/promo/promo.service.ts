/** Промокоды: поиск, проверка лимита по user/email, применение к корзине. */

import { prisma } from "@/prisma/prisma-client";
import { PromoValidationError, validatePromoForSubtotal } from "@/shared/lib/promo/validate-promo";
import type { PrismaClient } from "@prisma/client";
import { OrderStatus } from "@prisma/client";

/** Статусы заказов, считающихся «использованием» промокода */
const PROMO_USED_ORDER_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
] as const;

/** Результат применения промокода */
export type ApplyPromoResult =
  | { ok: true; promoId: number }
  | { ok: false; field: string; message: string };

/** Активный промокод по коду (уже uppercase) или null. */
export async function findActivePromoCode(
  prisma: PrismaClient,
  code: string,
) {
  const now = new Date();

  return prisma.promoCode.findFirst({
    where: {
      code,
      isActive: true,
      OR: [
        { endsAt: null },
        { endsAt: { gte: now } },
      ],
    },
  });
}

/** true, если пользователь уже использовал промокод в заказе. */
export async function hasUserUsedPromo(
  prisma: PrismaClient,
  userId: string,
  promoId: number,
): Promise<boolean> {
  const usedCount = await prisma.order.count({
    where: {
      userId,
      promoCodeId: promoId,
      status: { in: [...PROMO_USED_ORDER_STATUSES] },
    },
  });

  return usedCount > 0;
}

/** true, если для email уже есть заказ с этим промокодом (гостевой лимит). */
export async function hasEmailUsedPromo(
  prisma: PrismaClient,
  email: string,
  promoId: number,
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const usedCount = await prisma.order.count({
    where: {
      email: { equals: normalizedEmail, mode: "insensitive" },
      promoCodeId: promoId,
      status: { in: [...PROMO_USED_ORDER_STATUSES] },
    },
  });

  return usedCount > 0;
}

/** Применяет промокод к корзине (глобальный prisma). Для тестов — applyPromoToCartWithClient. */
export async function applyPromoToCart(
  code: string,
  cartId: number,
  subtotal: number,
  userId: string | null,
): Promise<ApplyPromoResult> {
  return applyPromoToCartWithClient(prisma, code, cartId, subtotal, userId);
}

/** Применяет промокод к корзине с переданным Prisma-клиентом. */
export async function applyPromoToCartWithClient(
  client: PrismaClient,
  code: string,
  cartId: number,
  subtotal: number,
  userId: string | null,
): Promise<ApplyPromoResult> {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { ok: false, field: "code", message: "Код промокода не может быть пустым." };
  }

  // Ищем активный промокод
  const promo = await findActivePromoCode(client, normalizedCode);

  if (!promo) {
    return { ok: false, field: "code", message: "Промокод не найден или отключён." };
  }

  // Валидация условий промокода
  try {
    validatePromoForSubtotal(promo, subtotal);
  } catch (error) {
    if (error instanceof PromoValidationError) {
      return { ok: false, field: error.field ?? "_global", message: error.message };
    }
    throw error;
  }

  // Проверка персонального лимита (1 заказ на пользователя)
  if (userId) {
    const alreadyUsed = await hasUserUsedPromo(client, userId, promo.id);
    if (alreadyUsed) {
      return {
        ok: false,
        field: "code",
        message: "Ты уже использовал этот промокод в одном из заказов. Каждый промокод можно применить только один раз.",
      };
    }
  }

  // Применяем промокод к корзине
  await client.cart.update({
    where: { id: cartId },
    data: { promoCodeId: promo.id },
  });

  return { ok: true, promoId: promo.id };
}
