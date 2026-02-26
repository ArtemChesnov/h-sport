import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest, type SessionUser } from "./session";
import { createErrorResponse } from "../api/error-response";

/**
 * Опции для withAuth wrapper
 */
export interface WithAuthOptions {
  /** Требуемая роль пользователя */
  role?: "USER" | "ADMIN";
  /** Дополнительные проверки (опционально) */
  requireEmailVerified?: boolean;
}

/**
 * Контекст, передаваемый в handler при успешной аутентификации
 */
export interface AuthContext {
  user: SessionUser;
  request: NextRequest;
}

/**
 * Тип handler функции с аутентификацией
 */
export type AuthenticatedHandler<T = unknown> = (
  context: AuthContext
) => Promise<NextResponse<T>> | NextResponse<T>;

/**
 * Wrapper для API routes с проверкой аутентификации и авторизации.
 *
 * @param options - Опции аутентификации
 * @returns Функция-wrapper для API handler
 *
 * @example
 * ```typescript
 * export const GET = withAuth({ role: 'ADMIN' })(async ({ user, request }) => {
 *   // user доступен и имеет роль ADMIN
 *   return NextResponse.json({ data: 'admin data' });
 * });
 * ```
 */
export function withAuth<T = unknown>(
  options: WithAuthOptions = {}
): (handler: AuthenticatedHandler<T>) => (request: NextRequest) => Promise<NextResponse> {
  return (handler: AuthenticatedHandler<T>) => {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        // 1. Извлекаем пользователя из сессии
        const user = await getSessionUserFromRequest(request);

        // 2. Проверяем, что пользователь авторизован
        if (!user) {
          return createErrorResponse("Требуется авторизация", 401);
        }

        // 3. Проверяем роль, если указана
        // ADMIN имеет доступ ко всем роутам, USER — только к USER роутам
        if (options.role === "ADMIN" && user.role !== "ADMIN") {
          return createErrorResponse("Доступ запрещён. Требуются права администратора.", 403);
        }
        // Для role: "USER" — пропускаем и USER, и ADMIN

        // 4. Дополнительные проверки
        if (options.requireEmailVerified && !user.emailVerified) {
          return createErrorResponse("Требуется подтверждённая почта", 403);
        }

        // 5. Вызываем handler с контекстом
        const context: AuthContext = { user, request };
        return await handler(context);

      } catch (error) {
        // При непредвиденных ошибках возвращаем 500
        const { logger } = await import("../logger");
        logger.error("withAuth: Ошибка аутентификации", error);
        return createErrorResponse("Внутренняя ошибка сервера", 500);
      }
    };
  };
}
