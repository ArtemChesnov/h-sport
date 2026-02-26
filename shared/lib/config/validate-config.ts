import { z } from "zod";

/**
 * Схема валидации обязательных переменных окружения.
 * Содержит только реально используемые переменные.
 */
const requiredConfigSchema = z.object({
  // База данных
  DATABASE_URL: z.string().url("DATABASE_URL должен быть валидным URL"),

  // Next.js приложение
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL должен быть валидным URL"),

  // Redis (обязателен для production, опционален для development)
  REDIS_URL: z.string().url("REDIS_URL должен быть валидным URL").optional(),
});

/**
 * Схема валидации опциональных переменных окружения.
 * Содержит переменные для дополнительных функций.
 */
const optionalConfigSchema = z.object({
  // CORS
  ALLOWED_ORIGINS: z.string().optional(),
  ALLOW_ANY_ORIGIN: z.string().optional(),

  // Bundle analyzer
  ANALYZE: z.string().optional(),

  // Алерты
  ALERT_EMAIL: z.string().email("ALERT_EMAIL должен быть валидным email").optional(),
  ALERT_WEBHOOK_URL: z.string().url("ALERT_WEBHOOK_URL должен быть валидным URL").optional(),

  // Аутентификация
  AUTH_URL: z.string().url("AUTH_URL должен быть валидным URL").optional(),

  // CDEK API
  CDEK_CLIENT_ID: z.string().optional(),
  CDEK_CLIENT_SECRET: z.string().optional(),
  CDEK_IS_TEST: z.string().optional(),

  // DaData API
  DADATA_TOKEN: z.string().optional(),

  // Настройки базы данных
  DB_POOL_MAX: z.string().regex(/^\d+$/, "DB_POOL_MAX должен быть числом").optional(),
  DB_POOL_TIMEOUT_MS: z.string().regex(/^\d+$/, "DB_POOL_TIMEOUT_MS должен быть числом").optional(),

  // Доставка
  DELIVERY_FEE_KOPECKS: z.string().regex(/^\d+$/, "DELIVERY_FEE_KOPECKS должен быть числом").optional(),

  // Логирование
  PRISMA_LOG_QUERIES: z.string().optional(),
  SLOW_QUERY_LOGGING: z.string().optional(),
  SLOW_QUERY_THRESHOLD_MS: z.string().regex(/^\d+$/, "SLOW_QUERY_THRESHOLD_MS должен быть числом").optional(),

  // SMTP
  SMTP_ALLOW_INSECURE_TLS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/, "SMTP_PORT должен быть числом").optional(),
  SMTP_USER: z.string().optional(),

  // Upstash Redis
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL должен быть валидным URL").optional(),
});

/**
 * Общая схема конфигурации
 */
const configSchema = requiredConfigSchema.merge(optionalConfigSchema);

/**
 * Тип конфигурации
 */
export type Config = z.infer<typeof configSchema>;

/**
 * Валидирует конфигурацию переменных окружения.
 * При ошибке печатает понятное сообщение и завершает процесс.
 */
export function validateConfig(): Config {
  try {
    const config = configSchema.parse(process.env);

    // Дополнительные проверки для production
    if (process.env.NODE_ENV === "production") {
      if (!config.REDIS_URL) {
        throw new Error("REDIS_URL обязателен в production окружении");
      }
    }

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Ошибка валидации конфигурации:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error("❌ Ошибка конфигурации:", error instanceof Error ? error.message : String(error));
    }

    console.error("\n💡 Проверьте переменные окружения в .env файле");
    console.error("📚 Подробная документация: https://github.com/your-repo/docs/env-setup\n");

    process.exit(1);
  }
}

/**
 * Получить валидированную конфигурацию (кешированная)
 */
let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = validateConfig();
  }
  return cachedConfig;
}
