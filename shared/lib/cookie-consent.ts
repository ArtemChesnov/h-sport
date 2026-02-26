/**
 * Cookie consent — разграничение обязательных и необязательных cookie.
 *
 * Обязательные (всегда используются, сайт не работает без них):
 *   - cart_token — корзина
 *   - session — авторизация
 *   - csrf_token — защита от CSRF
 *   - payment_return_to — редирект после оплаты (временная)
 *
 * Необязательные (только при согласии пользователя):
 *   - аналитика, маркетинг и т.п. — пока не используются
 */

export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent" as const;
export const COOKIE_CONSENT_ACCEPTED = "accepted" as const;
export const COOKIE_CONSENT_REJECTED = "rejected" as const;
export type CookieConsentStatus = typeof COOKIE_CONSENT_ACCEPTED | typeof COOKIE_CONSENT_REJECTED;

/**
 * Возвращает статус согласия на необязательные cookie.
 * null — пользователь ещё не сделал выбор (баннер не закрыт).
 */
export function getCookieConsent(): CookieConsentStatus | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (v === COOKIE_CONSENT_ACCEPTED || v === COOKIE_CONSENT_REJECTED) return v;
  return null;
}

/**
 * true — пользователь принял необязательные cookie (аналитика и т.п.).
 * false — отклонил или ещё не выбрал.
 */
export function hasAcceptedNonEssentialCookies(): boolean {
  return getCookieConsent() === COOKIE_CONSENT_ACCEPTED;
}

/**
 * true — пользователь уже сделал выбор (баннер можно не показывать).
 */
export function hasCookieConsentChoice(): boolean {
  return getCookieConsent() !== null;
}
