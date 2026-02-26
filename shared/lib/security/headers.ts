import type { NextRequest, NextResponse } from "next/server";

/**
 * Генерирует криптографически стойкий nonce для CSP
 * Использует Web Crypto API (доступен в Node.js 18+ и браузерах)
 */
function generateNonce(): string {
  // В современных средах (Node.js 18+, браузеры) crypto доступен глобально
  // Next.js middleware работает в Edge Runtime, где crypto также доступен
  const cryptoObj = globalThis.crypto;

  if (cryptoObj?.getRandomValues) {
    const array = new Uint8Array(16);
    cryptoObj.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  // Fallback для сред без Web Crypto (не должен использоваться в production)
  // Генерируем pseudo-random nonce (не криптографически стойкий)
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Формирует Content-Security-Policy заголовок в зависимости от окружения.
 *
 * Development:
 * - Разрешает 'unsafe-eval' и 'unsafe-inline' для работы hot reload и dev-инструментов
 * - Разрешает http:, ws:, wss: для локальной разработки
 *
 * Production:
 * - Убрано 'unsafe-eval' для повышения безопасности
 * - script-src использует nonce-based подход (без 'unsafe-inline')
 * - style-src оставляет 'unsafe-inline' для Tailwind CSS (который может генерировать inline стили)
 *   Примечание: для полного удаления 'unsafe-inline' из style-src потребуется настройка Tailwind
 *   для генерации всех стилей в отдельные файлы, что выходит за рамки текущей задачи.
 * - Только HTTPS источники
 */
export function getContentSecurityPolicy(isProduction: boolean, nonce?: string): string {
  if (isProduction) {
    // Production: строгая CSP с nonce для script-src
    // 'strict-dynamic' позволяет скриптам с nonce загружать другие скрипты
    // Это необходимо для корректной работы Next.js chunk loading
    const scriptNonce = nonce || generateNonce();
    return [
      "default-src 'self'",
      `script-src 'self' 'nonce-${scriptNonce}' 'strict-dynamic'`, // Nonce + strict-dynamic для Next.js
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind может генерировать inline стили
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; ");
  } else {
    // Development: расслабленная CSP для hot reload и dev-инструментов
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: http:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: http: ws: wss:",
    ].join("; ");
  }
}

/**
 * Получает nonce для текущего запроса (генерируется один раз на запрос)
 */
export function getRequestNonce(request: NextRequest): string {
  // Используем заголовок X-Nonce если он уже установлен (например, из middleware)
  const existingNonce = request.headers.get("X-Nonce");
  if (existingNonce) {
    return existingNonce;
  }
  // Генерируем новый nonce
  return generateNonce();
}

/**
 * Применяет все security headers к NextResponse.
 * Объединяет CORS, CSP, HSTS и другие заголовки безопасности.
 */
export function applySecurityHeaders(
  request: NextRequest,
  response: NextResponse,
  options: {
    corsOrigin?: string | null;
    isProduction: boolean;
    nonce?: string;
  }
): void {
  const { corsOrigin, isProduction, nonce } = options;

  // Генерируем nonce для CSP (если не передан)
  const cspNonce = nonce || (isProduction ? getRequestNonce(request) : undefined);

  // Устанавливаем nonce в заголовок для использования в компонентах (если нужно)
  if (cspNonce && isProduction) {
    response.headers.set("X-Nonce", cspNonce);
  }

  // CORS заголовки (если origin разрешен)
  if (corsOrigin) {
    response.headers.set("Access-Control-Allow-Origin", corsOrigin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Безопасные HTTP заголовки (аналог Helmet.js)

  // X-Content-Type-Options: предотвращает MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-Frame-Options: предотвращает clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // X-XSS-Protection: базовая защита от XSS (для старых браузеров)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy: контроль передачи referrer
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy: контроль доступа к API браузера
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
  );

  // Content-Security-Policy: политика безопасности контента
  response.headers.set("Content-Security-Policy", getContentSecurityPolicy(isProduction, cspNonce));

  // Strict-Transport-Security (HSTS): принудительное использование HTTPS
  if (isProduction && request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Удаляем заголовок X-Powered-By (скрывает информацию о сервере)
  response.headers.delete("X-Powered-By");
}

/**
 * Применяет CORS headers для preflight запросов (OPTIONS).
 */
export function applyCorsPreflightHeaders(
  response: NextResponse,
  corsOrigin: string
): void {
  response.headers.set("Access-Control-Allow-Origin", corsOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token"
  );
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 часа
}
