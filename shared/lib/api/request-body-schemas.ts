/**
 * Zod-схемы для валидации тел запросов API.
 * Используются вместе с validateRequestBody.
 */

import { z } from "zod";
import { MAX_CART_ITEM_QUANTITY } from "@/shared/lib/cart";

/** Добавление позиции в корзину: POST /api/shop/cart/items */
export const cartAddItemSchema = z.object({
  productItemId: z.coerce.number().int().positive("productItemId должен быть положительным числом"),
  qty: z.coerce
    .number()
    .int()
    .min(1, "Количество должно быть не менее 1")
    .max(
      MAX_CART_ITEM_QUANTITY,
      `Максимальное количество товара одной позиции — ${MAX_CART_ITEM_QUANTITY} штук`
    ),
});

export type CartAddItemBody = z.infer<typeof cartAddItemSchema>;

/** Обновление профиля: PATCH /api/shop/profile */
const addressSchema = z
  .object({
    country: z.string().nullable().optional(),
    city: z.string().optional(),
    street: z.string().optional(),
    zip: z.string().nullable().optional(),
  })
  .optional()
  .nullable();

export const userProfileUpdateSchema = z
  .object({
    phone: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    secondName: z.string().nullable().optional(),
    email: z.string().email("Некорректный email").optional(),
    birthDate: z.string().nullable().optional(),
    address: addressSchema,
  })
  .strict();

export type UserProfileUpdateBody = z.infer<typeof userProfileUpdateSchema>;

/** Добавление в избранное: POST /api/shop/favorites */
export const favoriteProductIdSchema = z.object({
  productId: z.coerce.number().int().positive("productId должен быть положительным числом"),
});

export type FavoriteProductIdBody = z.infer<typeof favoriteProductIdSchema>;

/** Обновление кол-ва позиции: PATCH /api/shop/cart/items/[id] */
export const cartUpdateItemSchema = z.object({
  qty: z.coerce
    .number()
    .int()
    .min(1, "Количество должно быть положительным целым числом")
    .max(
      MAX_CART_ITEM_QUANTITY,
      `Максимальное количество товара одной позиции — ${MAX_CART_ITEM_QUANTITY} штук`
    ),
});

export type CartUpdateItemBody = z.infer<typeof cartUpdateItemSchema>;

/** Применение промокода: POST /api/shop/cart/apply-promo */
export const promoCodeApplySchema = z.object({
  code: z.string().min(1, "Некорректный запрос: не передан code."),
});

export type PromoCodeApplyBody = z.infer<typeof promoCodeApplySchema>;

/** Подписка на рассылку: POST /api/shop/newsletter/subscribe */
export const newsletterSubscribeSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
  consent: z.literal(true, { error: "Необходимо согласие на получение рассылки" }),
  source: z.string().optional().default("footer"),
});

export type NewsletterSubscribeBody = z.infer<typeof newsletterSubscribeSchema>;

/** Создание рассылки (admin): POST /api/admin/newsletter/issues */
export const newsletterIssueCreateSchema = z.object({
  subject: z.string().min(1, "Укажите тему письма").trim(),
  bodyHtml: z.string().optional().default(""),
});

export type NewsletterIssueCreateBody = z.infer<typeof newsletterIssueCreateSchema>;

/** Обновление заказа (admin): PATCH /api/admin/orders/[id] */
export const adminOrderUpdateSchema = z
  .object({
    status: z.string().optional(),
    trackingNumber: z.string().nullable().optional(),
  })
  .passthrough();

export type AdminOrderUpdateBody = z.infer<typeof adminOrderUpdateSchema>;

/** Обновление роли пользователя (admin): PATCH /api/admin/users/[id] */
export const adminUserUpdateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"], { error: "Некорректная роль" }),
});

export type AdminUserUpdateRoleBody = z.infer<typeof adminUserUpdateRoleSchema>;
