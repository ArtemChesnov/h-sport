/**
 * Next.js Middleware для настройки CORS, CSRF и безопасности
 */

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME, generateCsrfToken, timingSafeEqual } from "@/shared/lib/csrf";
import { applyCorsPreflightHeaders, applySecurityHeaders } from "@/shared/lib/security/headers";
import { NextRequest, NextResponse } from "next/server";

const REQUEST_ID_HEADER = "x-request-id";

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Whitelist путей, которые не требуют CSRF проверки (webhooks, auth endpoints, metrics)
 */
function getCsrfWhitelist(): readonly string[] {
  const baseList = [
    "/api/payment/webhook", // Robokassa webhook
    "/api/auth/signin", // Авторизация (может быть первым запросом пользователя)
    "/api/auth/signup", // Регистрация (может быть первым запросом пользователя)
    "/api/auth/reset-password", // Восстановление пароля (запрос письма)
    "/api/auth/reset-password-confirm", // Подтверждение нового пароля (из ссылки в email)
    "/api/metrics/web-vitals", // Web Vitals метрики (отправляются автоматически с клиента)
    "/api/errors/client", // Клиентские ошибки (отправляются из error boundary)
  ] as const;

  // В development добавляем /api/payment/create для тестирования
  if (process.env.NODE_ENV === "development") {
    return [...baseList, "/api/payment/create"] as const;
  }

  return baseList;
}

const CSRF_WHITELIST = getCsrfWhitelist();

/**
 * Проверяет, находится ли путь в whitelist CSRF
 */
function isCsrfWhitelisted(pathname: string): boolean {
  return CSRF_WHITELIST.some((path) => pathname.startsWith(path));
}

/**
 * Получает разрешенные origins из переменных окружения
 */
function getAllowedOrigins(): string[] {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()) || [];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Добавляем локальный origin для development
  const origins = new Set<string>();
  if (appUrl) {
    origins.add(appUrl);
  }
  if (process.env.NODE_ENV === "development") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  // Добавляем разрешенные origins из переменной окружения
  allowedOrigins.forEach((origin) => {
    if (origin) {
      origins.add(origin);
    }
  });

  return Array.from(origins);
}

/**
 * Проверяет, разрешен ли origin
 */
function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }

  // В development разрешаем все origins для удобства разработки
  if (process.env.NODE_ENV === "development" && process.env.ALLOW_ANY_ORIGIN === "true") {
    return true;
  }

  return allowedOrigins.includes(origin);
}


/**
 * Защищённые маршруты, требующие авторизации (для прямого ввода URL)
 * /account покрывает все подстраницы: /account/favorites, /account/orders и т.д.
 */
const PROTECTED_ROUTES = ["/account"];

/**
 * Проверяет, требует ли путь авторизации
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

const isApiRoute = (pathname: string) => pathname.startsWith("/api/");

/**
 * Лёгкий путь для страниц магазина (каталог, товар, главная и т.д.):
 * только security headers и CSRF cookie. Без CORS/CSRF-проверки — меньше TTFB.
 */
function handlePageRoute(
  request: NextRequest,
  requestId: string,
  requestHeaders: Headers,
): NextResponse {
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  const isProduction = process.env.NODE_ENV === "production";
  applySecurityHeaders(request, response, {
    corsOrigin: null,
    isProduction,
  });
  const existingCsrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!existingCsrfToken) {
    response.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
      httpOnly: false,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  return response;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Request ID для трассировки в логах (прокидывается в заголовках запроса и ответа)
  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? generateRequestId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  // Страницы магазина (не API, не защищённые): минимум логики
  if (!isApiRoute(pathname) && !isProtectedRoute(pathname)) {
    return handlePageRoute(request, requestId, requestHeaders);
  }

  // Защищённые маршруты: проверка сессии, затем лёгкий путь (это страницы, не API)
  if (isProtectedRoute(pathname)) {
    const sessionCookie = request.cookies.get("session")?.value;
    if (!sessionCookie) {
      const signInUrl = new URL("/auth/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return handlePageRoute(request, requestId, requestHeaders);
  }

  // API routes: CORS, security headers, CSRF
  const origin = request.headers.get("origin");
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = isOriginAllowed(origin, allowedOrigins);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  const isProduction = process.env.NODE_ENV === "production";

  if (request.method === "OPTIONS") {
    const preflightResponse = new NextResponse(null, { status: 204 });
    preflightResponse.headers.set(REQUEST_ID_HEADER, requestId);
    if (isAllowed && origin) {
      applyCorsPreflightHeaders(preflightResponse, origin);
    }
    return preflightResponse;
  }

  applySecurityHeaders(request, response, {
    corsOrigin: isAllowed && origin ? origin : null,
    isProduction,
  });

  const existingCsrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!existingCsrfToken) {
    response.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
      httpOnly: false,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  const method = request.method;
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (isMutating && isApiRoute(pathname) && !isCsrfWhitelisted(pathname)) {
    const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    const csrfHeader = request.headers.get(CSRF_HEADER_NAME);
    if (!csrfCookie || !csrfHeader) {
      return NextResponse.json(
        { message: "Invalid or missing CSRF token" },
        { status: 403 }
      );
    }
    if (!timingSafeEqual(csrfCookie, csrfHeader)) {
      return NextResponse.json(
        { message: "Invalid or missing CSRF token" },
        { status: 403 }
      );
    }
  }

  return response;
}

// Matcher: все пути кроме _next/static, _next/image, favicon.
// Внутри middleware три ветки: страницы → лёгкий путь; protected → auth + лёгкий; API → полный.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
