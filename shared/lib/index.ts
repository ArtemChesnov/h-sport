/**
 * Единая точка входа для утилит и сервисов (shared/lib).
 * Импорты из подмодулей: @/shared/lib/rate-limit, @/shared/lib/products/admin, и т.д.
 */

// --- Базовые утилиты ---
export { logger } from "./logger";
export { cn } from "./utils";

// --- Конфигурация и окружение ---
export * from "./config";

// --- Форматирование, генераторы ---
export * from "./formatters";
export * from "./generators";

// --- Валидация и ошибки ---
export * from "./validation";
export * from "./errors";

// --- Повтор, поиск, данные ---
export * from "./retry";
export * from "./search";
export * from "./data";

// --- SEO ---
export * from "./seo";

// --- Кэш, пагинация, rate limiting ---
export * from "./cache";
export * from "./pagination";
export * from "./rate-limit";

// --- API: обработка ошибок, middleware ---
export * from "./api/error-handler";

// --- Авторизация ---
export * from "./auth";

// --- Чекаут (флаги доставки) ---
export { getDeliveryMethodFlags } from "./checkout";

// --- Cookie consent ---
export {
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_REJECTED,
  COOKIE_CONSENT_STORAGE_KEY,
  getCookieConsent,
  hasAcceptedNonEssentialCookies,
  hasCookieConsentChoice,
} from "./cookie-consent";
export type { CookieConsentStatus } from "./cookie-consent";
