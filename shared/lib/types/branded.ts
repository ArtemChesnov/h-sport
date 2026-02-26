/**
 * Branded types для типобезопасности
 * Позволяют различать примитивные типы с одинаковым базовым типом
 */

/**
 * Branded type для ID пользователя
 */
export type UserId = string & { readonly __brand: "UserId" };

/**
 * Branded type для ID товара
 */
export type ProductId = number & { readonly __brand: "ProductId" };

/**
 * Branded type для ID заказа
 */
export type OrderId = number & { readonly __brand: "OrderId" };

/**
 * Branded type для email
 */
export type Email = string & { readonly __brand: "Email" };

/**
 * Type guard для проверки, является ли строка валидным email
 */
export function isEmail(value: string): value is Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Type guard для проверки, является ли число валидным ProductId
 */
export function isProductId(value: number): value is ProductId {
  return Number.isInteger(value) && value > 0;
}

/**
 * Type guard для проверки, является ли число валидным OrderId
 */
export function isOrderId(value: number): value is OrderId {
  return Number.isInteger(value) && value > 0;
}
