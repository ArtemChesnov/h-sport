/**
 * Серверный сервис избранного: список, добавление, удаление.
 * Использует FavoritesRepository, маппит в DTO, записывает метрики.
 */

import {
  FavoritesRepository,
  type FavoriteWithProductRow,
} from "@/shared/repositories/favorites.repository";
import { mapProductsToListDto } from "@/shared/lib/products";
import type * as DTO from "@/shared/services/dto";

function mapRowsToFavoriteDtos(rows: FavoriteWithProductRow[]): DTO.FavoriteDto[] {
  const products = rows.filter((f) => f.product).map((f) => f.product!);
  const productDtos = mapProductsToListDto(products as Parameters<typeof mapProductsToListDto>[0]);
  const productMap = new Map<number, DTO.ProductListItemDto>();
  productDtos.forEach((p) => productMap.set(p.id, p));

  return rows
    .map<DTO.FavoriteDto | null>((f) => {
      const product = productMap.get(f.productId);
      if (!product) return null;
      return { productId: f.productId, product };
    })
    .filter((item): item is DTO.FavoriteDto => item !== null);
}

/**
 * Загружает список избранного пользователя в формате DTO.
 */
export async function loadUserFavoritesList(userId: string): Promise<DTO.FavoriteDto[]> {
  const rows = await FavoritesRepository.findManyByUserId(userId);
  return mapRowsToFavoriteDtos(rows);
}

/**
 * Добавляет товар в избранное. Возвращает актуальный список.
 * Если товар не найден, возвращает null (вызывающий route вернёт 404).
 */
export async function addFavorite(
  userId: string,
  productId: number
): Promise<{ items: DTO.FavoriteDto[]; wasNew: boolean } | null> {
  const productExists = await FavoritesRepository.existsProduct(productId);
  if (!productExists) return null;

  const existing = await FavoritesRepository.findUnique(userId, productId);
  const wasNew = existing == null;

  await FavoritesRepository.upsert(userId, productId);

  if (wasNew) {
    try {
      const { recordFavoriteAction } = await import("@/shared/lib/ecommerce-metrics");
      recordFavoriteAction("add", productId, userId).catch(() => {});
    } catch {
      /* ignore */
    }
  }

  const items = await loadUserFavoritesList(userId);
  return { items, wasNew };
}

/**
 * Удаляет товар из избранного. Возвращает актуальный список.
 * Если товар не найден, возвращает null (route вернёт 404).
 */
export async function removeFavorite(
  userId: string,
  productId: number
): Promise<{ items: DTO.FavoriteDto[] } | null> {
  const productExists = await FavoritesRepository.existsProduct(productId);
  if (!productExists) return null;

  const deletedCount = await FavoritesRepository.deleteMany(userId, productId);

  if (deletedCount > 0) {
    try {
      const { recordFavoriteAction } = await import("@/shared/lib/ecommerce-metrics");
      recordFavoriteAction("remove", productId, userId).catch(() => {});
    } catch {
      /* ignore */
    }
  }

  const items = await loadUserFavoritesList(userId);
  return { items };
}
