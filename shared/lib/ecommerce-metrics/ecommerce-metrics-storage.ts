/**
 * Хранилище e-commerce метрик в памяти
 */

import type {
  CartActionMetric,
  ConversionMetric,
  FavoriteActionMetric,
  ProductViewMetric,
} from "./ecommerce-metrics-types";
import { MAX_METRICS } from "./ecommerce-metrics-types";

export const productViews: ProductViewMetric[] = [];
export const cartActions: CartActionMetric[] = [];
export const favoriteActions: FavoriteActionMetric[] = [];
export const conversions: ConversionMetric[] = [];

/**
 * Добавляет метрику просмотра товара с ограничением размера.
 * Использует политику FIFO: при достижении лимита самые старые записи вытесняются первыми.
 */
export function addProductView(metric: ProductViewMetric): void {
  if (productViews.length >= MAX_METRICS) {
    productViews.shift(); // Вытесняем самую старую запись (FIFO)
  }
  productViews.push(metric);
}

/**
 * Добавляет метрику действия с корзиной с ограничением размера.
 * Использует политику FIFO: при достижении лимита самые старые записи вытесняются первыми.
 */
export function addCartAction(metric: CartActionMetric): void {
  if (cartActions.length >= MAX_METRICS) {
    cartActions.shift(); // Вытесняем самую старую запись (FIFO)
  }
  cartActions.push(metric);
}

/**
 * Добавляет метрику действия с избранным с ограничением размера.
 * Использует политику FIFO: при достижении лимита самые старые записи вытесняются первыми.
 */
export function addFavoriteAction(metric: FavoriteActionMetric): void {
  if (favoriteActions.length >= MAX_METRICS) {
    favoriteActions.shift(); // Вытесняем самую старую запись (FIFO)
  }
  favoriteActions.push(metric);
}

/**
 * Добавляет метрику конверсии с ограничением размера.
 * Использует политику FIFO: при достижении лимита самые старые записи вытесняются первыми.
 */
export function addConversion(metric: ConversionMetric): void {
  if (conversions.length >= MAX_METRICS) {
    conversions.shift(); // Вытесняем самую старую запись (FIFO)
  }
  conversions.push(metric);
}
