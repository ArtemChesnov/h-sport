/**
 * Репозиторий для работы с избранным.
 *
 * Инкапсулирует Prisma-запросы к Favorite и проверку существования Product.
 */

import { prisma } from "@/prisma/prisma-client";
import { FAVORITES_MAX_PER_USER } from "@/shared/constants";
import type { Prisma } from "@prisma/client";

const FAVORITE_PRODUCT_SELECT = {
  id: true,
  slug: true,
  name: true,
  images: true,
  tags: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
  items: {
    select: {
      id: true,
      price: true,
      color: true,
      size: true,
      sku: true,
      isAvailable: true,
      imageUrls: true,
    },
  },
} as const satisfies Prisma.ProductSelect;

export type FavoriteWithProductRow = Prisma.FavoriteGetPayload<{
  select: {
    productId: true;
    createdAt: true;
    product: {
      select: typeof FAVORITE_PRODUCT_SELECT;
    };
  };
}>;

export class FavoritesRepository {
  /**
   * Избранное пользователя с продуктами (для списка).
   */
  static async findManyByUserId(userId: string): Promise<FavoriteWithProductRow[]> {
    return prisma.favorite.findMany({
      where: { userId },
      select: {
        productId: true,
        createdAt: true,
        product: {
          select: FAVORITE_PRODUCT_SELECT,
        },
      },
      orderBy: { createdAt: "desc" },
      take: FAVORITES_MAX_PER_USER,
    });
  }

  /**
   * Одна запись избранного по паре (userId, productId).
   */
  static async findUnique(
    userId: string,
    productId: number,
  ): Promise<{ userId: string; productId: number } | null> {
    const row = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
      select: { userId: true, productId: true },
    });
    return row;
  }

  /**
   * Добавить в избранное (upsert по уникальному индексу).
   */
  static async upsert(userId: string, productId: number): Promise<void> {
    await prisma.favorite.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: {},
    });
  }

  /**
   * Удалить из избранного. Возвращает количество удалённых записей.
   */
  static async deleteMany(userId: string, productId: number): Promise<number> {
    const result = await prisma.favorite.deleteMany({
      where: { userId, productId },
    });
    return result.count;
  }

  /**
   * Существует ли товар по id (для валидации перед добавлением/удалением).
   */
  static async existsProduct(productId: number): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    return product != null;
  }
}
