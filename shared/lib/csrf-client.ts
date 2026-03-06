/**
 * Клиентская утилита для чтения CSRF токена.
 * Токен берётся из meta-тега (рендерится CsrfMeta на сервере),
 * cookie при этом httpOnly — из JS недоступен.
 */

/**
 * Читает CSRF токен из meta[name="csrf-token"].
 * @returns токен или null, если не найден
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || null;
}
