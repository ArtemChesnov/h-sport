/**
 * Типы для e-commerce метрик
 */

export interface ProductViewMetric {
  productId: number;
  timestamp: number;
  userId?: string;
}

export interface CartActionMetric {
  action: "add" | "remove" | "update";
  productId: number;
  quantity: number;
  timestamp: number;
  userId?: string;
  cartId?: string;
}

export interface FavoriteActionMetric {
  action: "add" | "remove";
  productId: number;
  timestamp: number;
  userId: string;
}

export interface ConversionMetric {
  type: "view_to_cart" | "cart_to_order" | "view_to_order";
  productId?: number;
  orderId?: number;
  timestamp: number;
  userId?: string;
}

export const MAX_METRICS = 10000;
