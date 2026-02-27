/**
 * Валидация переменных окружения
 */

import { z } from "zod";

const envSchema = z.object({
  // База данных — опционально в схеме, на сервере обязательно
  DATABASE_URL: z.string().optional(),

  // Redis — опционально; без него rate-limit и кеш in-memory
  REDIS_URL: z.string().optional(),

  // CDEK API
  CDEK_CLIENT_ID: z.string().optional(),
  CDEK_CLIENT_SECRET: z.string().optional(),
  CDEK_IS_TEST: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  // DaData API
  DADATA_TOKEN: z.string().optional(),

  // Авторизация
  AUTH_SECRET: z.string().optional(),
  AUTH_URL: z.string().url().optional(),

  // Email (модуль auth)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_ALLOW_INSECURE_TLS: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  // SMTP_FROM: "Имя <email@example.com>" или "email@example.com"
  SMTP_FROM: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // Проверяем формат "Name <email>" или просто "email"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameEmailRegex = /^[^<]+<[^\s@]+@[^\s@]+\.[^\s@]+>$/;
        return emailRegex.test(val) || nameEmailRegex.test(val);
      },
      { message: "SMTP_FROM должен быть валидным email или в формате 'Name <email@example.com>'" }
    ),

  // Платёжная система (модуль payment)
  ROBOKASSA_MERCHANT_LOGIN: z.string().optional(),
  ROBOKASSA_PASSWORD_1: z.string().optional(),
  ROBOKASSA_PASSWORD_2: z.string().optional(),
  ROBOKASSA_IS_TEST: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  ROBOKASSA_HASH_ALGORITHM: z.enum(["md5", "sha256", "sha512"]).optional(),

  // Next.js / окружение
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_API_URL: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "NEXT_PUBLIC_API_URL должен быть валидным URL или пустой строкой" }
    ),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Логирование
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).optional(),
  ENABLE_FILE_LOGGING: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  PRISMA_LOG_QUERIES: z.string().optional(),

  // Алерты (email / webhook для 5xx)
  ALERT_EMAIL: z.string().optional(),
  ALERT_WEBHOOK_URL: z.string().optional(),

  // Пункты выдачи (макс. размер in-memory кеша)
  PICKUP_POINTS_MAX_CACHE_SIZE: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Валидированные переменные окружения
 * Бросит ошибку при запуске, если обязательные переменные отсутствуют
 * На клиенте серверные переменные (например, DATABASE_URL) не валидируются
 */
export const env = (() => {
  try {
    const parsed = envSchema.parse(process.env);

    // На сервере (кроме тестов) проверяем, что DATABASE_URL установлен
    if (typeof window === "undefined" && parsed.NODE_ENV !== "test") {
      if (!parsed.DATABASE_URL || parsed.DATABASE_URL.length === 0) {
        throw new Error(
          "❌ Ошибка конфигурации окружения:\n  - DATABASE_URL: DATABASE_URL обязателен\n\nПроверьте файл .env"
        );
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `❌ Ошибка конфигурации окружения:\n${error.issues
          .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
          .join("\n")}\n\nПроверьте файл .env`
      );
    }
    throw error;
  }
})();

/** Домен приложения в production. Используется как fallback в env.client и в getAppUrl. */
export const APP_DOMAIN_PRODUCTION = "https://h-brand.ru";

/**
 * Базовый URL приложения на сервере (для webhook, письма, sitemap и т.д.).
 * Приоритет: AUTH_URL → NEXT_PUBLIC_APP_URL → production: h-brand.ru, иначе localhost.
 */
export function getAppUrl(): string {
  const e = env;
  if (e.AUTH_URL) return e.AUTH_URL;
  if (e.NEXT_PUBLIC_APP_URL) return e.NEXT_PUBLIC_APP_URL;
  return e.NODE_ENV === "production" ? APP_DOMAIN_PRODUCTION : "http://localhost:3000";
}
