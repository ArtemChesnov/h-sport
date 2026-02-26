/**
 * Расширение интерфейса ProcessEnv для типизации переменных окружения.
 * Соответствует схеме в validate-config / env.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- глобальный namespace для ProcessEnv
  namespace NodeJS {
    interface ProcessEnv {
      // Обязательные переменные
      DATABASE_URL: string;
      NEXT_PUBLIC_APP_URL: string;
      REDIS_URL?: string;

      // Опциональные переменные
      ALLOWED_ORIGINS?: string;
      ALLOW_ANY_ORIGIN?: string;
      ANALYZE?: string;
      ALERT_EMAIL?: string;
      ALERT_WEBHOOK_URL?: string;
      AUTH_URL?: string;
      CDEK_CLIENT_ID?: string;
      CDEK_CLIENT_SECRET?: string;
      CDEK_IS_TEST?: string;
      DADATA_TOKEN?: string;
      DB_POOL_MAX?: string;
      DB_POOL_TIMEOUT_MS?: string;
      DELIVERY_FEE_KOPECKS?: string;
      PRISMA_LOG_QUERIES?: string;
      SLOW_QUERY_LOGGING?: string;
      SLOW_QUERY_THRESHOLD_MS?: string;
      SMTP_ALLOW_INSECURE_TLS?: string;
      SMTP_FROM?: string;
      SMTP_HOST?: string;
      SMTP_PASSWORD?: string;
      SMTP_PORT?: string;
      SMTP_USER?: string;
      UPSTASH_REDIS_REST_TOKEN?: string;
      UPSTASH_REDIS_REST_URL?: string;

      // Next.js переменные (автоматически добавляются)
      readonly NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
