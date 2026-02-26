import { axiosInstance } from "../../http";

const API_ROUTES = {
  SIGNOUT: "/auth/signout",
} as const;

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
