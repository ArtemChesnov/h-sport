/**
 * Middleware для проверки авторизации и прав доступа.
 *
 * Единый фасад для API:
 * - getSessionUserOrError(request) — один вызов: либо { user }, либо { error: NextResponse<ErrorResponse> }. Рекомендуется для shop-маршрутов.
 * - requireAdmin(request) — текущий пользователь с ролью ADMIN или 401/403 (для admin-маршрутов).
 * - getSessionUserFromRequest(request) — низкоуровневый доступ к сессии для опционального user (метрики, корзина).
 * - getCurrentUser(request) — alias для getSessionUserFromRequest.
 */

import type { ErrorResponse } from "@/shared/dto";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { NextRequest, NextResponse } from "next/server";
import { isPrivilegedEmail } from "./privileged";
import { getSessionUserFromRequest } from "./session";
import type { SessionUser } from "./session";

/** Результат проверки сессии: либо пользователь, либо ответ с ошибкой 401. */
export type SessionUserOrError = { user: SessionUser } | { error: NextResponse<ErrorResponse> };

/**
 * Возвращает текущего пользователя или ответ 401. Один вызов — без повторного чтения сессии.
 * Использовать в shop-маршрутах вместо getSessionUserFromRequest + ручной 401.
 */
export async function getSessionUserOrError(request: NextRequest): Promise<SessionUserOrError> {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return { error: createErrorResponse("Требуется авторизация", 401) };
  }
  return { user };
}

/**
 * Проверяет, является ли пользователь администратором. Возвращает 401/403 в формате ErrorResponse или null.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const user = await getSessionUserFromRequest(request);
  if (!user) {
    return createErrorResponse("Требуется авторизация", 401);
  }
  const isAdmin = user.role === "ADMIN" || isPrivilegedEmail(user.email);
  if (!isAdmin) {
    return createErrorResponse("Доступ запрещён. Требуются права администратора.", 403);
  }
  return null;
}

/**
 * Получает текущего пользователя или возвращает null
 */
export async function getCurrentUser(request: NextRequest) {
  return getSessionUserFromRequest(request);
}
