/**
 * Функции для записи e-commerce метрик в БД
 */
import { addProductView, addCartAction, addFavoriteAction, addConversion } from "./ecommerce-metrics-storage";

/**
 * Записывает просмотр товара в память и БД (асинхронно)
 */
export async function recordProductView(productId: number, userId?: string): Promise<void> {
  // Сохраняем в память для быстрого доступа
  addProductView({
    productId,
    timestamp: Date.now(),
    userId,
  });

  // Сохраняем в БД асинхронно (fire-and-forget, не блокируем ответ API)
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    void prisma.productView
      .create({
        data: {
          productId,
          userId: userId || null,
        },
      })
      .catch(() => {
        // Игнорируем ошибки БД
      });
  } catch {
    // Игнорируем ошибки импорта или БД
  }
}

/**
 * Записывает действие с корзиной в память и БД (асинхронно)
 */
export async function recordCartAction(
  action: "add" | "remove" | "update",
  productId: number,
  quantity: number,
  userId?: string,
  cartId?: string,
): Promise<void> {
  // Сохраняем в память
  addCartAction({
    action,
    productId,
    quantity,
    timestamp: Date.now(),
    userId,
    cartId,
  });

  // Сохраняем в БД асинхронно (fire-and-forget, не блокируем ответ API)
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    void prisma.cartAction
      .create({
        data: {
          action,
          productId,
          quantity,
          userId: userId || null,
          cartId: cartId || null,
        },
      })
      .catch(() => {
        // Игнорируем ошибки БД
      });
  } catch {
    // Игнорируем ошибки импорта или БД
  }
}

/**
 * Записывает действие с избранным в память и БД (асинхронно)
 */
export async function recordFavoriteAction(
  action: "add" | "remove",
  productId: number,
  userId: string,
): Promise<void> {
  // Сохраняем в память
  addFavoriteAction({
    action,
    productId,
    timestamp: Date.now(),
    userId,
  });

  // Сохраняем в БД асинхронно (fire-and-forget, не блокируем ответ API)
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    void prisma.favoriteAction
      .create({
        data: {
          action,
          productId,
          userId,
        },
      })
      .catch(() => {
        // Игнорируем ошибки БД
      });
  } catch {
    // Игнорируем ошибки импорта или БД
  }
}

/**
 * Записывает конверсию в память и БД (асинхронно)
 */
export async function recordConversion(
  type: "view_to_cart" | "cart_to_order" | "view_to_order",
  productId?: number,
  orderId?: number,
  userId?: string,
): Promise<void> {
  // Сохраняем в память
  addConversion({
    type,
    productId,
    orderId,
    timestamp: Date.now(),
    userId,
  });

  // Сохраняем в БД асинхронно (fire-and-forget, не блокируем ответ API)
  try {
    const { prisma } = await import("@/prisma/prisma-client");
    void prisma.conversion
      .create({
        data: {
          type,
          productId: productId || null,
          orderId: orderId || null,
          userId: userId || null,
        },
      })
      .catch(() => {
        // Игнорируем ошибки БД
      });
  } catch {
    // Игнорируем ошибки импорта или БД
  }
}
