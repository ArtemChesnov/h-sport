/**
 * Валидация переменных окружения
 */

import { z } from "zod";

const envSchema = z.object({
  // Database - опциональный в схеме, но обязателен на сервере
  // Валидация на сервере выполняется отдельно
  DATABASE_URL: z.string().optional(),

  // CDEK API (опционально)
  CDEK_CLIENT_ID: z.string().optional(),
  CDEK_CLIENT_SECRET: z.string().optional(),
  CDEK_IS_TEST: z.string().optional().transform((val) => val === "true"),

  // DaData API (опционально)
  DADATA_TOKEN: z.string().optional(),

  // Auth (опционально, для модуля auth)
  AUTH_SECRET: z.string().optional(),
  AUTH_URL: z.string().url().optional(),

  // Email (опционально, для модуля auth)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_ALLOW_INSECURE_TLS: z.string().optional().transform((val) => val === "true"),
  // SMTP_FROM может быть в формате "Name <email@example.com>" или просто "email@example.com"
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
      { message: "SMTP_FROM должен быть валидным email или в формате 'Name <email@example.com>'" },
    ),

  // Payment (опционально, для модуля payment)
  ROBOKASSA_MERCHANT_LOGIN: z.string().optional(),
  ROBOKASSA_PASSWORD_1: z.string().optional(),
  ROBOKASSA_PASSWORD_2: z.string().optional(),
  ROBOKASSA_IS_TEST: z.string().optional().transform((val) => val === "true"),
  ROBOKASSA_HASH_ALGORITHM: z.enum(["md5", "sha256", "sha512"]).optional(),

  // Next.js
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // NEXT_PUBLIC_API_URL может быть пустым или валидным URL
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
      { message: "NEXT_PUBLIC_API_URL должен быть валидным URL или пустой строкой" },
    ),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Logging
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).optional(),
  PRISMA_LOG_QUERIES: z.string().optional(),
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

    // На сервере проверяем, что DATABASE_URL установлен
    if (typeof window === "undefined") {
      if (!parsed.DATABASE_URL || parsed.DATABASE_URL.length === 0) {
        throw new Error("❌ Ошибка конфигурации окружения:\n  - DATABASE_URL: DATABASE_URL обязателен\n\nПроверьте файл .env");
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `❌ Ошибка конфигурации окружения:\n${error.issues
          .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
          .join("\n")}\n\nПроверьте файл .env`,
      );
    }
    throw error;
  }
})();
