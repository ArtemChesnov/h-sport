/** Позиции корзины: добавление, валидация, сообщения об ошибках. */

import { MAX_CART_ITEM_QUANTITY } from "@/shared/lib/cart";
import type { Prisma } from "@prisma/client";

/** Результат добавления в корзину */
export type AddItemResult =
  | { ok: true; productId: number }
  | { ok: false; code: CartItemErrorCode };

export type CartItemErrorCode =
  | "PRODUCT_ITEM_NOT_FOUND"
  | "PRODUCT_ITEM_NOT_AVAILABLE"
  | "MAX_QUANTITY_EXCEEDED"
  | "INVALID_QUANTITY";

/** Добавляет позицию в корзину в транзакции, затем вызывает recalculateFn. */
export async function addItemToCart(
  tx: Prisma.TransactionClient,
  cartId: number,
  productItemId: number,
  qty: number,
  recalculateFn: (cartId: number, tx: Prisma.TransactionClient) => Promise<void>,
): Promise<AddItemResult> {
  // Проверяем наличие и доступность варианта
  const productItem = await tx.productItem.findUnique({
    where: { id: productItemId },
  });

  if (!productItem) {
    return { ok: false, code: "PRODUCT_ITEM_NOT_FOUND" };
  }

  if (!productItem.isAvailable) {
    return { ok: false, code: "PRODUCT_ITEM_NOT_AVAILABLE" };
  }

  // Проверяем текущее количество
  const existingItem = await tx.cartItem.findUnique({
    where: {
      cartId_productItemId: { cartId, productItemId },
    },
  });

  const newQty = existingItem ? existingItem.qty + qty : qty;

  if (newQty > MAX_CART_ITEM_QUANTITY) {
    return { ok: false, code: "MAX_QUANTITY_EXCEEDED" };
  }

  // upsert позиции
  await tx.cartItem.upsert({
    where: {
      cartId_productItemId: { cartId, productItemId },
    },
    update: {
      qty: { increment: qty },
    },
    create: {
      cartId,
      productItemId,
      qty,
      price: productItem.price,
    },
  });

  // Пересчитываем агрегаты
  await recalculateFn(cartId, tx);

  return { ok: true, productId: productItem.productId };
}

/** Валидация productItemId и qty для добавления в корзину. */
export function validateAddItemInput(
  productItemId: unknown,
  qty: unknown,
): { ok: true; productItemId: number; qty: number } | { ok: false; message: string } {
  const parsedId = Number(productItemId);
  const parsedQty = qty ?? 1;
  const qtyNum = Number(parsedQty);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return { ok: false, message: "Некорректный идентификатор товара" };
  }

  if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
    return { ok: false, message: "Количество должно быть положительным целым числом" };
  }

  if (qtyNum > MAX_CART_ITEM_QUANTITY) {
    return { ok: false, message: `Максимальное количество товара одной позиции — ${MAX_CART_ITEM_QUANTITY} штук` };
  }

  return { ok: true, productItemId: parsedId, qty: qtyNum };
}

/** Текстовое сообщение по коду ошибки. */
export function getCartItemErrorMessage(code: CartItemErrorCode): string {
  switch (code) {
    case "PRODUCT_ITEM_NOT_FOUND":
      return "Вариант товара не найден";
    case "PRODUCT_ITEM_NOT_AVAILABLE":
      return "Вариант товара недоступен для заказа";
    case "MAX_QUANTITY_EXCEEDED":
      return `Максимальное количество товара одной позиции — ${MAX_CART_ITEM_QUANTITY} штук`;
    case "INVALID_QUANTITY":
      return "Некорректное количество";
    default:
      return "Ошибка при добавлении в корзину";
  }
}
