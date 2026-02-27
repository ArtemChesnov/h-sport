/**
 * CSRF защита для мутационных API
 *
 * Механизм:
 * 1. Сервер генерирует токен и отправляет его в cookie (csrf_token)
 * 2. Клиент читает токен из cookie и отправляет в заголовке X-CSRF-Token
 * 3. Сервер проверяет, что токен в cookie совпадает с токеном в заголовке
 *
 * Защита от CSRF: сторонний сайт не может прочитать cookie с другого домена (Same-Origin Policy)
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { env } from "@/shared/lib/config/env";

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "X-CSRF-Token";
const CSRF_TOKEN_LENGTH = 32;

/**
 * Генерирует криптографически безопасный CSRF токен
 */
export function generateCsrfToken(): string {
  // Используем crypto.randomUUID для генерации безопасного токена
  // В Node.js 19+ и браузерах это доступно глобально
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }

  // Fallback для старых версий
  const array = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Устанавливает CSRF токен в cookie (для использования в Server Components)
 */
export async function setCsrfCookie(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!token) {
    token = generateCsrfToken();
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // клиент должен читать для отправки в заголовке
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 часа
    });
  }

  return token;
}

/**
 * Проверяет CSRF токен из запроса
 *
 * @param request - NextRequest объект
 * @returns true если токен валиден, false если нет
 */
export async function verifyCsrfToken(request: NextRequest): Promise<boolean> {
  // Пропускаем проверку для GET, HEAD, OPTIONS
  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (safeMethod) {
    return true;
  }

  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const csrfHeader = request.headers.get(CSRF_HEADER_NAME);

  // Оба должны присутствовать и совпадать
  if (!csrfCookie || !csrfHeader) {
    return false;
  }

  // Сравнение с постоянным временем для защиты от timing attacks
  return timingSafeEqual(csrfCookie, csrfHeader);
}

/**
 * Middleware для проверки CSRF токена
 * Возвращает ошибку или null если всё ок
 */
export async function requireCsrf(request: NextRequest): Promise<NextResponse | null> {
  const isValid = await verifyCsrfToken(request);

  if (!isValid) {
    return createErrorResponse("Неверный или отсутствующий CSRF токен", 403);
  }

  return null;
}

/**
 * Устанавливает CSRF cookie в response (для API routes)
 */
export function setCsrfCookieInResponse(response: NextResponse, token?: string): string {
  const csrfToken = token || generateCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return csrfToken;
}

/**
 * Сравнение строк с постоянным временем для защиты от timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Имена констант для использования на клиенте
 */
export const CSRF_CONFIG = {
  cookieName: CSRF_COOKIE_NAME,
  headerName: CSRF_HEADER_NAME,
} as const;
