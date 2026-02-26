/**
 * Система сессий на основе JWT токенов в cookie
 */

import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

/**
 * Минимальная длина AUTH_SECRET для безопасного HS256
 */
const MIN_SECRET_LENGTH = 32;

/**
 * Получает секретный ключ для JWT (только на сервере)
 */
function getSecret(): Uint8Array {
  // Проверяем, что мы на сервере
  if (typeof window !== "undefined") {
    throw new Error("getSecret() can only be called on the server");
  }

  const SECRET_KEY = process.env.AUTH_SECRET;
  if (!SECRET_KEY) {
    throw new Error("AUTH_SECRET is not set. Please configure environment variable.");
  }

  if (SECRET_KEY.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET is too short. Minimum length is ${MIN_SECRET_LENGTH} characters for secure HS256 signing.`
    );
  }

  return new TextEncoder().encode(SECRET_KEY);
}

export interface SessionUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: Date | null;
  sessionVersion: number;
}

/**
 * Время жизни сессии
 * 7 дней — баланс между UX и безопасностью.
 * Для критичных систем рекомендуется использовать sliding sessions
 * с более коротким базовым сроком (например, 1 час) и обновлением при активности.
 */
const SESSION_TTL_DAYS = 7;
const SESSION_TTL_SECONDS = 60 * 60 * 24 * SESSION_TTL_DAYS;

/**
 * Создаёт JWT токен для сессии
 */
export async function createSession(user: SessionUser): Promise<string> {
  const secret = getSecret();
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified?.toISOString() || null,
    sessionVersion: user.sessionVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(secret);

  return token;
}

/**
 * Верифицирует JWT токен из cookie
 */
export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;
    const sessionVersion = (payload.sessionVersion as number) ?? 0;

    // Проверяем sessionVersion в БД
    const { prisma } = await import("@/prisma/prisma-client");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { sessionVersion: true },
    });

    if (!user || user.sessionVersion !== sessionVersion) {
      // Сессия недействительна (была отозвана)
      return null;
    }

    return {
      id: userId,
      email: payload.email as string,
      role: payload.role as "USER" | "ADMIN",
      emailVerified: payload.emailVerified
        ? new Date(payload.emailVerified as string)
        : null,
      sessionVersion,
    };
  } catch {
    return null;
  }
}

/**
 * Получает пользователя из сессии (для серверных компонентов)
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // Динамический импорт, чтобы избежать проблем с клиентскими компонентами
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Получает пользователя из сессии из запроса (для API routes)
 */
export async function getSessionUserFromRequest(
  request: NextRequest,
): Promise<SessionUser | null> {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

/**
 * Устанавливает cookie с сессией
 *
 * Безопасность:
 * - httpOnly: true — защита от XSS (cookie недоступен через JavaScript)
 * - secure: true в production — cookie отправляется только по HTTPS
 * - sameSite: "strict" — максимальная защита от CSRF (cookie не отправляется с cross-site запросами)
 *
 * Примечание: sameSite: "strict" может влиять на UX при переходах с внешних сайтов.
 * Если требуется поддержка OAuth или внешних редиректов, используйте "lax".
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

/**
 * Удаляет cookie с сессией
 */
export function deleteSessionCookie(response: NextResponse): void {
  response.cookies.delete("session");
}
