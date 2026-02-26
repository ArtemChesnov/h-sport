/**
 * Переиспользуемые Zod схемы для валидации
 */

import { MAX_SEARCH_QUERY_LENGTH } from "@/shared/constants";
import { z } from "zod";

/**
 * Схема для валидации email
 */
export const emailSchema = z.string().email("Некорректный email");

/**
 * Схема для валидации пароля
 */
export const passwordSchema = z
  .string()
  .min(8, "Пароль должен содержать минимум 8 символов")
  .regex(/[A-Za-z]/, "Пароль должен содержать буквы")
  .regex(/[0-9]/, "Пароль должен содержать цифры");

/**
 * Схема для валидации поискового запроса
 */
export const searchQuerySchema = z
  .string()
  .max(MAX_SEARCH_QUERY_LENGTH, `Поисковый запрос не должен превышать ${MAX_SEARCH_QUERY_LENGTH} символов`)
  .optional()
  .transform((val) => val?.trim() || undefined);

/**
 * Схема для валидации пагинации
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Схема для валидации ID (число)
 */
export const idSchema = z.coerce.number().int().positive();

/**
 * Схема для валидации slug
 */
export const slugSchema = z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug может содержать только строчные буквы, цифры и дефисы");

/**
 * Доступные методы доставки
 */
export const deliveryMethodSchema = z.enum([
  "CDEK_PVZ",
  "CDEK_COURIER",
  "POCHTA_PVZ",
  "POCHTA_COURIER",
  "PICKUP_SHOWROOM",
]);

/**
 * Схема для валидации телефона (российский формат)
 */
export const phoneSchema = z
  .string()
  .min(1, "Телефон обязателен")
  .max(20, "Телефон слишком длинный")
  .regex(
    /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
    "Некорректный формат телефона"
  )
  .optional()
  .or(z.literal(""));

/**
 * Методы доставки, для которых город и адрес обязательны
 */
const DELIVERY_METHODS_REQUIRING_ADDRESS = [
  "CDEK_PVZ",
  "CDEK_COURIER",
  "POCHTA_PVZ",
  "POCHTA_COURIER",
] as const;

/**
 * Схема для доставки в заказе
 * Для курьерской и ПВЗ доставки город и адрес обязательны
 * Для самовывоза (PICKUP_SHOWROOM) — не обязательны
 */
export const orderDeliverySchema = z
  .object({
    method: deliveryMethodSchema,
    city: z
      .string()
      .max(100, "Название города слишком длинное")
      .nullable()
      .optional(),
    address: z
      .string()
      .max(500, "Адрес слишком длинный")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    const requiresAddress = DELIVERY_METHODS_REQUIRING_ADDRESS.includes(
      data.method as (typeof DELIVERY_METHODS_REQUIRING_ADDRESS)[number]
    );

    if (requiresAddress) {
      if (!data.city || data.city.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите город доставки",
          path: ["city"],
        });
      }
      if (!data.address || data.address.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите адрес доставки",
          path: ["address"],
        });
      }
    }
  });

/**
 * Схема для создания заказа (POST /api/shop/orders)
 *
 * Используется и на клиенте (react-hook-form), и на сервере
 */
export const orderCreateSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail обязателен")
    .email("Некорректный email")
    .max(255, "Email слишком длинный"),
  phone: z
    .string()
    .max(20, "Телефон слишком длинный")
    .optional()
    .nullable(),
  fullName: z
    .string()
    .max(200, "ФИО слишком длинное")
    .optional()
    .nullable(),
  delivery: orderDeliverySchema,
});

/**
 * Тип данных для создания заказа (выведен из схемы)
 */
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;

/**
 * Схема для регистрации пользователя
 *
 * Используется и на клиенте (react-hook-form), и на сервере
 */
export const signUpSchema = z.object({
  email: emailSchema.max(255, "Email слишком длинный"),
  password: passwordSchema,
  name: z.string().min(1, "Имя обязательно").max(100, "Имя слишком длинное"),
  secondName: z.string().max(100, "Фамилия слишком длинная").optional(),
});

/**
 * Схема для входа пользователя
 */
export const signInSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен").min(8, "Пароль должен содержать минимум 8 символов"),
  remember: z.boolean().default(false),
});

/**
 * Тип данных для регистрации
 */
export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Тип данных для входа
 */
export type SignInInput = z.infer<typeof signInSchema>;
