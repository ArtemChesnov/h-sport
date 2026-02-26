/**
 * Функции для агрегации e-commerce метрик
 */

import type {
  ProductViewMetric,
  CartActionMetric,
  FavoriteActionMetric,
  ConversionMetric,
} from "./ecommerce-metrics-types";

/**
 * Вычисляет статистику по просмотрам товаров
 */
export function aggregateViews(views: ProductViewMetric[]) {
  const productViewCounts: Record<number, number> = {};
  for (const view of views) {
    productViewCounts[view.productId] = (productViewCounts[view.productId] || 0) + 1;
  }

  const topViewedProducts = Object.entries(productViewCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([productId, count]) => ({
      productId: parseInt(productId, 10),
      views: count,
    }));

  const uniqueViewers = new Set(views.map((v) => v.userId).filter(Boolean));

  return {
    total: views.length,
    uniqueUsers: uniqueViewers.size,
    topProducts: topViewedProducts,
  };
}

/**
 * Вычисляет статистику по корзине
 */
export function aggregateCart(cartActions: CartActionMetric[]) {
  const cartAdds = cartActions.filter((a) => a.action === "add");
  const cartAddCounts: Record<number, number> = {};
  for (const add of cartAdds) {
    cartAddCounts[add.productId] = (cartAddCounts[add.productId] || 0) + add.quantity;
  }

  const topCartProducts = Object.entries(cartAddCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([productId, count]) => ({
      productId: parseInt(productId, 10),
      adds: count,
    }));

  const uniqueCartUsers = new Set(cartAdds.map((a) => a.userId).filter(Boolean));

  return {
    totalAdds: cartAdds.length,
    uniqueUsers: uniqueCartUsers.size,
    topProducts: topCartProducts,
  };
}

/**
 * Вычисляет статистику по избранному
 */
export function aggregateFavorites(favorites: FavoriteActionMetric[]) {
  const favoriteAdds = favorites.filter((f) => f.action === "add");
  const favoriteCounts: Record<number, number> = {};
  for (const fav of favoriteAdds) {
    favoriteCounts[fav.productId] = (favoriteCounts[fav.productId] || 0) + 1;
  }

  const topFavoriteProducts = Object.entries(favoriteCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([productId, count]) => ({
      productId: parseInt(productId, 10),
      favorites: count,
    }));

  const uniqueFavoriteUsers = new Set(favoriteAdds.map((f) => f.userId).filter(Boolean));

  return {
    totalAdds: favoriteAdds.length,
    uniqueUsers: uniqueFavoriteUsers.size,
    topProducts: topFavoriteProducts,
  };
}

/**
 * Вычисляет статистику по конверсиям
 */
export function aggregateConversions(
  conversions: ConversionMetric[],
  totalViews: number,
  totalCartAdds: number,
) {
  const viewToCart = conversions.filter((c) => c.type === "view_to_cart").length;
  const cartToOrder = conversions.filter((c) => c.type === "cart_to_order").length;
  const viewToOrder = conversions.filter((c) => c.type === "view_to_order").length;

  const viewToCartRate = totalViews > 0 ? (viewToCart / totalViews) * 100 : 0;
  const cartToOrderRate = totalCartAdds > 0 ? (cartToOrder / totalCartAdds) * 100 : 0;

  return {
    viewToCart: {
      count: viewToCart,
      rate: viewToCartRate,
    },
    cartToOrder: {
      count: cartToOrder,
      rate: cartToOrderRate,
    },
    viewToOrder: {
      count: viewToOrder,
    },
  };
}

/**
 * Вычисляет коэффициент вовлеченности
 */
export function calculateEngagementRate(
  uniqueViewers: Set<string>,
  uniqueCartUsers: Set<string>,
  uniqueFavoriteUsers: Set<string>,
): number {
  const engagedUsers = new Set([...uniqueCartUsers, ...uniqueFavoriteUsers]);
  return uniqueViewers.size > 0 ? (engagedUsers.size / uniqueViewers.size) * 100 : 0;
}

/**
 * Вычисляет статистику по просмотрам товаров (включая уникальных пользователей)
 */
export function getUniqueUsersFromViews(views: ProductViewMetric[]): Set<string> {
  return new Set(views.map((v) => v.userId).filter((id): id is string => Boolean(id)));
}
