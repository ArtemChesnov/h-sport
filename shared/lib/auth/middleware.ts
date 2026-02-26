/**
 * Middleware для проверки авторизации и прав доступа
 */

import { NextRequest, NextResponse } from "next/server";
import { isPrivilegedEmail } from "./privileged";
import { getSessionUserFromRequest } from "./session";

/**
 * Проверяет, авторизован ли пользователь
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Требуется авторизация" },
      { status: 401 },
    );
  }

  return null;
}

/**
 * Проверяет, является ли пользователь администратором
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const user = await getSessionUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Требуется авторизация" },
      { status: 401 },
    );
  }

  const isAdmin = user.role === "ADMIN" || isPrivilegedEmail(user.email);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, message: "Доступ запрещён. Требуются права администратора." },
      { status: 403 },
    );
  }

  return null;
}

/**
 * Получает текущего пользователя или возвращает null
 */
export async function getCurrentUser(request: NextRequest) {
  return getSessionUserFromRequest(request);
}
