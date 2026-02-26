
import type * as DTO from "../../../dto";
import { axiosInstance } from "../../../http";
import { getApiErrorMessage } from "../../api-errors";

const API_ROUTES = {
  PROFILE: "/shop/profile",
} as const;

/**
 * Получить профиль текущего пользователя.
 *
 * Примечание: 401 ошибка здесь - это нормальное поведение при проверке авторизации,
 * поэтому она не должна логироваться в консоль.
 */
export async function fetchUserProfile(): Promise<DTO.UserProfileDto> {
  try {
    const { data } = await axiosInstance.get<DTO.UserProfileDto>(API_ROUTES.PROFILE);
    return data;
  } catch (error) {
    // Проверяем, является ли это 401 ошибкой (неавторизован)
    // Для 401 просто пробрасываем ошибку дальше без логирования
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 401
    ) {
      // 401 - это ожидаемо при проверке авторизации, пробрасываем ошибку
      throw error;
    }
    // Для других ошибок логируем как обычно
    throw new Error(
      getApiErrorMessage(error, "Не удалось загрузить профиль пользователя"),
    );
  }
}

/**
 * Обновить профиль текущего пользователя.
 */
export async function updateUserProfile(
  payload: DTO.UserProfileUpdateDto,
): Promise<DTO.UserProfileDto> {
  try {
    const { data } = await axiosInstance.patch<DTO.UserProfileDto>(
      API_ROUTES.PROFILE,
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "Не удалось обновить профиль пользователя"),
    );
  }
}

