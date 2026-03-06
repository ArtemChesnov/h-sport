import type { NextRequest, NextResponse } from "next/server";

/**
 * Формирует Content-Security-Policy заголовок в зависимости от окружения.
 *
 * Production: 'unsafe-inline' в script-src необходим для Next.js App Router,
 * который генерирует inline-скрипты для RSC-payload и гидрации.
 * Middleware не может модифицировать HTML body, поэтому nonce-подход не применим.
 *
 * Защита от криптомайнеров (cryptojacking):
 * - worker-src 'self' — только свои воркеры, блокирует сторонние майнеры в Web Workers
 * - object-src 'none' — блокирует плагины (Flash и т.п.), часто используемые майнерами
 * - base-uri 'self' — запрет подмены base URL для загрузки скриптов с чужих доменов
 */
export function getContentSecurityPolicy(isProduction: boolean): string {
  if (isProduction) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "worker-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; ");
  } else {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: http:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https: http: ws: wss:",
      "worker-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ");
  }
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
  }
): void {
  const { corsOrigin, isProduction } = options;

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

  // Permissions-Policy: ограничение API браузера (в т.ч. защита от криптомайнеров:
  // отключены фоновое выполнение, датчики и возможности, часто используемые майнерами)
  response.headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "ambient-light-sensor=()",
      "battery=()",
      "camera=()",
      "display-capture=()",
      "execution-while-not-rendered=()",
      "execution-while-out-of-viewport=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "screen-wake-lock=()",
      "usb=()",
    ].join(", ")
  );

  // Content-Security-Policy: политика безопасности контента
  response.headers.set("Content-Security-Policy", getContentSecurityPolicy(isProduction));

  // Strict-Transport-Security (HSTS): принудительное использование HTTPS
  if (isProduction && request.nextUrl.protocol === "https:") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Удаляем заголовок X-Powered-By (скрывает информацию о сервере)
  response.headers.delete("X-Powered-By");
}

/**
 * Применяет CORS headers для preflight запросов (OPTIONS).
 */
export function applyCorsPreflightHeaders(response: NextResponse, corsOrigin: string): void {
  response.headers.set("Access-Control-Allow-Origin", corsOrigin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token"
  );
  response.headers.set("Access-Control-Max-Age", "86400"); // 24 часа
}
