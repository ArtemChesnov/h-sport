import { prisma } from "@/prisma/prisma-client";
import { DEFAULT_DELIVERY_FEE, FREE_DELIVERY_THRESHOLD_KOPECKS } from "@/shared/constants";
import {
  createErrorResponse,
  createValidationErrorResponse,
} from "@/shared/lib/api/error-response";
import { calculatePromoDiscount } from "@/shared/lib/promo";
import type * as DTO from "@/shared/services/dto";
import { hasEmailUsedPromo } from "@/shared/services/server/shop/promo/promo.service";
import { DeliveryMethod } from "@prisma/client";

export interface OrderCreationParams {
  userId: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  cartToken: string;
  delivery: {
    method: string;
    city?: string | null;
    address?: string | null;
  };
  idempotencyKey?: string | null;
}

export interface OrderCreationResult {
  id: number;
  uid: string;
  status: DTO.OrderStatusDto;
  total: number;
  totalItems: number;
  createdAt: string;
}

export interface OrderEmailData {
  id: number;
  uid: string;
  total: number;
  totalItems: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  promoCodeCode: string | null;
  items: Array<{
    productName: string;
    qty: number;
    price: number;
    size: string | null;
    color: string | null;
  }>;
  delivery: {
    method: string;
    city: string | null;
    address: string | null;
  };
}

export interface OrderCreationFullResult extends OrderCreationResult {
  emailData: OrderEmailData;
}

/**
 * Создаёт заказ из корзины.
 * Возвращает данные заказа + emailData (без дополнительного запроса к БД).
 */
export async function createOrderFromCart(
  params: OrderCreationParams
): Promise<OrderCreationFullResult> {
  const { userId, phone, fullName, cartToken, delivery, idempotencyKey } = params;
  const email = params.email.trim().toLowerCase();

  const cart = await prisma.cart.findUnique({
    where: { cartToken },
    select: {
      id: true,
      userId: true,
      promoCodeId: true,
      promoCode: {
        select: { type: true, value: true, code: true },
      },
      items: {
        select: {
          qty: true,
          price: true,
          productItem: {
            select: {
              productId: true,
              sku: true,
              color: true,
              size: true,
              isAvailable: true,
              imageUrls: true,
              product: { select: { name: true, images: true } },
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw createErrorResponse("Корзина пуста", 400);
  }

  for (const item of cart.items) {
    if (!item.productItem.isAvailable) {
      throw createValidationErrorResponse(
        "Некоторые товары в корзине стали недоступны",
        [
          {
            field: "_global",
            message: `Товар "${item.productItem.product.name}" (${item.productItem.color}, ${item.productItem.size}) недоступен для заказа`,
          },
        ],
        400
      );
    }
  }

  let totalItems = 0;
  let subtotal = 0;
  for (const item of cart.items) {
    totalItems += item.qty;
    subtotal += item.qty * item.price;
  }

  let discount = 0;
  let promoCodeId: number | null = null;
  let promoCodeCode: string | null = null;

  if (cart.promoCodeId && cart.promoCode) {
    discount = calculatePromoDiscount({
      type: cart.promoCode.type,
      value: cart.promoCode.value,
      subtotal,
    });
    promoCodeId = cart.promoCodeId;
    promoCodeCode = cart.promoCode.code;
  }

  if (promoCodeId) {
    const alreadyUsedByEmail = await hasEmailUsedPromo(prisma, email, promoCodeId);
    if (alreadyUsedByEmail) {
      throw createValidationErrorResponse(
        "Промокод уже использован",
        [
          {
            field: "promo",
            message:
              "Промокод на первый заказ уже был использован для этого email. Снимите промокод в корзине или оформите заказ без скидки.",
          },
        ],
        400
      );
    }
  }

  const orderSum = subtotal - discount;
  const isPickup = delivery.method === "PICKUP_SHOWROOM";
  const isCdek = delivery.method === "CDEK_PVZ" || delivery.method === "CDEK_COURIER";
  const isRussianPost = delivery.method === "POCHTA_PVZ" || delivery.method === "POCHTA_COURIER";

  let deliveryFee = 0;
  if (cart.items.length > 0 && !isPickup && orderSum < FREE_DELIVERY_THRESHOLD_KOPECKS) {
    if (isCdek && delivery.city) {
      const { calculateCDEKTariff } =
        await import("@/modules/shipping/lib/pickupPoints/providers/cdek");
      const mode = delivery.method === "CDEK_PVZ" ? "pvz" : "courier";
      const tariff = await calculateCDEKTariff(delivery.city, mode as "pvz" | "courier");
      deliveryFee = tariff?.deliverySum ?? DEFAULT_DELIVERY_FEE;
    } else if (isRussianPost && delivery.city) {
      const { calculateRussianPostTariff } =
        await import("@/modules/shipping/lib/pickupPoints/providers/russianpost");
      const mode = delivery.method === "POCHTA_PVZ" ? "pvz" : "courier";
      const valuationRub = Math.max(1, Math.round(orderSum / 100));
      const tariff = await calculateRussianPostTariff(
        delivery.city,
        mode as "pvz" | "courier",
        1000,
        valuationRub
      );
      deliveryFee = tariff?.deliverySum ?? DEFAULT_DELIVERY_FEE;
    } else {
      deliveryFee = DEFAULT_DELIVERY_FEE;
    }
  }
  const total = orderSum + deliveryFee;

  const { retryWithBackoff } = await import("@/shared/lib/retry");

  const order = await retryWithBackoff(() =>
    prisma.$transaction(async (tx) => {
      if (!cart.userId) {
        await tx.cart.update({
          where: { id: cart.id },
          data: { userId },
        });
      }

      const created = await tx.order.create({
        data: {
          ...(idempotencyKey ? { uid: idempotencyKey } : {}),
          userId,
          cartToken,
          status: "NEW",
          email,
          phone,
          fullName,

          promoCodeId,
          promoCodeCode,

          totalItems,
          subtotal,
          discount,
          deliveryFee,
          total,

          delivery: {
            create: {
              method: delivery.method as DeliveryMethod,
              city: delivery.city ?? null,
              address: delivery.address ?? null,
              trackingCode: null,
              price: deliveryFee,
            },
          },

          items: {
            create: cart.items.map((cartItem) => ({
              productId: cartItem.productItem.productId,
              productName: cartItem.productItem.product.name,
              sku: cartItem.productItem.sku,
              color: cartItem.productItem.color,
              size: cartItem.productItem.size,
              qty: cartItem.qty,
              price: cartItem.price,
              total: cartItem.qty * cartItem.price,
              productImageUrl:
                cartItem.productItem.imageUrls[0] ?? cartItem.productItem.product.images[0] ?? null,
            })),
          },
        },
      });

      if (promoCodeId) {
        await tx.promoCode.update({
          where: { id: promoCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          totalItems: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
          promoCodeId: null,
        },
      });

      return created;
    })
  );

  const emailData: OrderEmailData = {
    id: order.id,
    uid: order.uid,
    total,
    totalItems,
    subtotal,
    discount,
    deliveryFee,
    promoCodeCode,
    items: cart.items.map((cartItem) => ({
      productName: cartItem.productItem.product.name,
      qty: cartItem.qty,
      price: cartItem.price,
      size: cartItem.productItem.size,
      color: cartItem.productItem.color,
    })),
    delivery: {
      method: delivery.method,
      city: delivery.city ?? null,
      address: delivery.address ?? null,
    },
  };

  try {
    const { recordConversion } = await import("@/shared/lib/ecommerce-metrics");
    for (const cartItem of cart.items) {
      void recordConversion("cart_to_order", cartItem.productItem.productId, order.id, userId);
    }
  } catch {
    // не блокируем оформление заказа при ошибке метрик
  }

  return {
    id: order.id,
    uid: order.uid,
    status: order.status as DTO.OrderStatusDto,
    total: order.total,
    totalItems: order.totalItems,
    createdAt: order.createdAt.toISOString(),
    emailData,
  };
}

/**
 * Находит пользователя по email или создаёт нового (гостевой чекаут).
 */
export async function getOrCreateUserByEmail(params: {
  email: string;
  fullName?: string | null;
  phone?: string | null;
}): Promise<string> {
  const email = params.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;

  let name: string | null = null;
  let secondName: string | null = null;

  if (params.fullName) {
    const parts = params.fullName.trim().split(/\s+/);
    if (parts.length > 0) name = parts[0];
    if (parts.length > 1) secondName = parts.slice(1).join(" ");
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      secondName,
      phone: params.phone ?? null,
      role: "USER",
      passwordHash: null,
      emailVerified: null,
    },
  });

  return user.id;
}

/**
 * Проверяет, подтверждён ли email у пользователя.
 * Возвращает true если email подтверждён или пользователь не найден (fail-open для обратной совместимости).
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });
  if (!user) return true;
  return user.emailVerified !== null && user.emailVerified !== undefined;
}
