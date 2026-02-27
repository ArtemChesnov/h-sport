/** Сессия корзины: get/create по cookie, загрузка с связями, маппинг в DTO, пересчёт агрегатов. */

import { prisma } from "@/prisma/prisma-client";
import { calculatePromoDiscount } from "@/shared/lib/promo";
import type * as DTO from "@/shared/services/dto";
import type { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";

export const CART_COOKIE_NAME = "cart_token";

const CART_SELECT = {
  id: true,
  cartToken: true,
  totalItems: true,
  subtotal: true,
  discount: true,
  total: true,
  promoCodeId: true,
  items: {
    select: {
      id: true,
      qty: true,
      price: true,
      productItem: {
        select: {
          id: true,
          color: true,
          size: true,
          imageUrls: true,
          isAvailable: true,
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              images: true,
            },
          },
        },
      },
    },
  },
  promoCode: {
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      isActive: true,
      startsAt: true,
      endsAt: true,
      usageLimit: true,
      usedCount: true,
      minOrder: true,
    },
  },
} as const;

export type CartWithRelations = Prisma.CartGetPayload<{
  select: typeof CART_SELECT;
}>;

export async function loadCartWithRelations(cartId: number): Promise<CartWithRelations> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    select: CART_SELECT,
  });

  if (!cart) {
    throw new Error("Корзина не найдена");
  }

  return cart;
}

/** Корзина по токену cookie или null. */
export async function getCartByToken(cartToken: string | undefined) {
  if (!cartToken) return null;
  return prisma.cart.findUnique({
    where: { cartToken },
  });
}

/** Позиция корзины по cartId и cartItemId. */
export async function findCartItem(cartId: number, cartItemId: number) {
  return prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId },
  });
}

/** Сбрасывает промокод у корзины. */
export async function clearCartPromo(cartId: number): Promise<void> {
  await prisma.cart.update({
    where: { id: cartId },
    data: { promoCodeId: null },
  });
}

export async function getOrCreateCartCore(request: NextRequest) {
  const cookieValue = request.cookies.get(CART_COOKIE_NAME)?.value;

  let cart = null;

  if (cookieValue) {
    cart = await prisma.cart.findUnique({
      where: { cartToken: cookieValue },
    });
  }

  if (!cart) {
    const token = randomUUID();

    cart = await prisma.cart.create({
      data: {
        cartToken: token,
      },
    });

    return { cart, newToken: token };
  }

  return { cart, newToken: null as string | null };
}

export async function removeUnavailableItems(
  cartId: number,
  tx?: Prisma.TransactionClient
): Promise<boolean> {
  const client = tx || prisma;

  const cart = await client.cart.findUnique({
    where: { id: cartId },
    select: {
      id: true,
      items: {
        select: {
          id: true,
          productItem: {
            select: {
              id: true,
              isAvailable: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return false;
  }

  const unavailableItemIds = cart.items
    .filter((item) => !item.productItem.isAvailable)
    .map((item) => item.id);

  if (unavailableItemIds.length === 0) {
    return false;
  }

  await client.cartItem.deleteMany({
    where: {
      id: { in: unavailableItemIds },
      cartId,
    },
  });

  return true;
}

export async function recalculateCartAggregates(
  cartId: number,
  tx?: Prisma.TransactionClient,
  forceRecalculate: boolean = false
): Promise<void> {
  const client = tx || prisma;

  const cart = await client.cart.findUnique({
    where: { id: cartId },
    select: {
      id: true,
      totalItems: true,
      subtotal: true,
      discount: true,
      total: true,
      promoCodeId: true,
      items: {
        select: {
          id: true,
          qty: true,
          price: true,
        },
      },
      promoCode: {
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
          isActive: true,
          startsAt: true,
          endsAt: true,
          usageLimit: true,
          usedCount: true,
          minOrder: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Корзина не найдена");
  }

  const totalItems = cart.items.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.qty, 0);

  let discount = 0;
  let promoCodeId: number | null = null;

  if (cart.promoCodeId && cart.promoCode) {
    const now = new Date();
    const promo = cart.promoCode;

    const isPromoValid =
      promo.isActive &&
      (!promo.startsAt || promo.startsAt <= now) &&
      (!promo.endsAt || promo.endsAt >= now) &&
      (promo.usageLimit === null || promo.usedCount < promo.usageLimit) &&
      (promo.minOrder === null || subtotal >= promo.minOrder);

    if (isPromoValid) {
      discount = calculatePromoDiscount({
        type: promo.type,
        value: promo.value,
        subtotal,
      });
      promoCodeId = cart.promoCodeId;
    } else {
      promoCodeId = null;
    }
  }

  const total = subtotal - discount;

  if (!forceRecalculate) {
    const hasChanges =
      cart.totalItems !== totalItems ||
      cart.subtotal !== subtotal ||
      cart.discount !== discount ||
      cart.total !== total ||
      cart.promoCodeId !== promoCodeId;

    if (!hasChanges) {
      return;
    }
  }

  await client.cart.update({
    where: { id: cartId },
    data: {
      totalItems,
      subtotal,
      discount,
      total,
      promoCodeId,
    },
  });
}

export function mapCartToDto(cart: CartWithRelations): DTO.CartDto {
  const items: DTO.CartItemDto[] = cart.items.map((item) => {
    const productItem = item.productItem;
    const product = productItem.product;

    const total = item.price * item.qty;

    const imageUrl =
      (Array.isArray(productItem.imageUrls) && productItem.imageUrls[0]) ||
      (Array.isArray(product.images) && product.images[0]) ||
      null;

    return {
      id: item.id,
      productItemId: productItem.id,
      product: {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        imageUrl: imageUrl ?? null,
      },
      color: productItem.color,
      size: productItem.size as DTO.SizeDto,
      qty: item.qty,
      price: item.price,
      total,
    };
  });

  const totalItems = items.reduce((acc, it) => acc + it.qty, 0);
  const subtotal = items.reduce((acc, it) => acc + it.total, 0);

  const discount = cart.discount ?? 0;
  const total = cart.total ?? subtotal - discount;

  const promoCode = cart.promoCode && cart.promoCodeId ? cart.promoCode.code : null;

  return {
    token: cart.cartToken || String(cart.id),
    totalItems,
    subtotal,
    discount,
    total,
    promoCode,
    items,
  };
}

/** Выполняет fn в транзакции Prisma. */
export async function runCartTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}
