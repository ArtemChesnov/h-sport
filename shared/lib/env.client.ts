/**
 * Типизированные публичные переменные окружения для клиента.
 * Использовать вместо прямого доступа к process.env.NEXT_PUBLIC_* — меньше опечаток и единая точка правок.
 *
 * Production-домен приложения: h-brand.ru (см. APP_DOMAIN_PRODUCTION в shared/lib/config/env).
 */

const raw = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
} as const;

/**
 * Публичный URL приложения (сайт). Используется в ссылках, письмах, sitemap, OAuth.
 */
export const env = {
  /** Базовый URL приложения (production: https://h-brand.ru). В браузере при отсутствии env — current origin. */
  get appUrl(): string {
    if (raw.NEXT_PUBLIC_APP_URL) return raw.NEXT_PUBLIC_APP_URL;
    if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
    return "https://h-brand.ru";
  },
  /** Базовый URL API (если отдельный бекенд). По умолчанию относительный /api */
  get apiUrl(): string {
    return raw.NEXT_PUBLIC_API_URL ?? "/api";
  },
} as const;

export type EnvClient = typeof env;
