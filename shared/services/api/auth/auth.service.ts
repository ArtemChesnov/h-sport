import { axiosInstance } from "../../http";

const API_ROUTES = {
  ME: "/auth/me",
  SIGNOUT: "/auth/signout",
} as const;

/** Минимальные данные пользователя из GET /api/auth/me (проверка сессии без загрузки профиля из БД) */
export interface AuthMeUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: string | null;
  sessionVersion: number;
}

/**
 * Проверка авторизации: лёгкий запрос к /api/auth/me (только сессия, без загрузки профиля из БД).
 * 401 — ожидаемо для неавторизованных, не ретраить.
 */
export async function fetchAuthMe(): Promise<AuthMeUser> {
  const { data } = await axiosInstance.get<{ success: true; user: AuthMeUser }>(API_ROUTES.ME);
  if (!data?.user) throw new Error("Некорректный ответ /api/auth/me");
  return data.user;
}

/**
 * Выход пользователя из системы
 */
export async function signout(): Promise<void> {
  try {
    await axiosInstance.post(API_ROUTES.SIGNOUT);
  } catch (error) {
    // Игнорируем ошибки при выходе - в любом случае удаляем локальное состояние
    // Логируем только в development, т.к. это клиентский код
    if (process.env.NODE_ENV === "development") {
      console.warn("Ошибка при выходе:", error);
    }
  }
}
