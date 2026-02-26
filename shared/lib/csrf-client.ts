/**
 * Клиентская утилита для чтения CSRF токена из cookie.
 * Использовать только в клиентских компонентах (document доступен).
 * Константа дублируется здесь, чтобы не импортировать csrf.ts (он использует next/headers).
 */
const CSRF_COOKIE_NAME = "csrf_token";

/**
 * Читает CSRF токен из document.cookie.
 * @returns токен или null, если не найден
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${CSRF_COOKIE_NAME}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}
