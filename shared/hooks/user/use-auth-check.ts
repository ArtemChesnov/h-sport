
"use client";

import { subscribeToAuthBroadcast } from "@/shared/lib/auth/auth-broadcast";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { USER_PROFILE_QUERY_KEY, useUserProfileQuery } from "./user-profile.hooks";

/** sessionStorage: флаг неавторизованности. Один запрос после загрузки. */
export const UNAUTHORIZED_FLAG_KEY = "h-sport:unauthorized";

function setUnauthorizedFlag(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      sessionStorage.setItem(UNAUTHORIZED_FLAG_KEY, "true");
    } else {
      sessionStorage.removeItem(UNAUTHORIZED_FLAG_KEY);
    }
  } catch {
    // Игнорируем ошибки sessionStorage
  }
}

/**
 * Хук для проверки авторизации пользователя на клиенте
 *
 * Проверяет авторизацию через запрос к API /api/shop/profile
 * Cookie с httpOnly: true недоступна в JavaScript, поэтому проверяем через API
 *
 * SSR-safe: на сервере возвращает { isAuthenticated: false, isLoading: true }
 * isLoading: true на сервере для предотвращения hydration mismatch
 *
 * @returns {isAuthenticated: boolean, isLoading: boolean}
 */
export function useAuthCheck() {
  const isClient = typeof window !== "undefined";

  // SSR: возвращаем mock результат чтобы не вызывать useQueryClient на сервере
  // isLoading: true чтобы на сервере и клиенте был одинаковый рендеринг
  if (!isClient) {
    return {
      isAuthenticated: false,
      isLoading: true, // true для предотвращения hydration mismatch
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов хуков: выполняется только на клиенте после проверки isClient
  const queryClient = useQueryClient();

  // Определяем, нужно ли делать запрос
  const cachedProfile = queryClient.getQueryData(USER_PROFILE_QUERY_KEY);

  // Логика shouldFetch:
  // Всегда делаем запрос, кроме случая когда в кэше уже есть валидный профиль.
  //
  // ВАЖНО: раньше при 401 в кэш записывался null, и мы не делали запрос если cachedProfile === null.
  // Это создавало проблему: после успешного логина кэш мог содержать null,
  // и запрос не выполнялся. Теперь мы всегда делаем запрос если нет валидного профиля.
  //
  // Если пользователь не авторизован, получим 401 — это нормально.
  // React Query имеет retry: false для 401, так что спама не будет.
  const hasValidProfile = cachedProfile && typeof cachedProfile === "object" && "id" in cachedProfile;
  const shouldFetch = !hasValidProfile;

  // Запрашиваем профиль
  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов хуков: выполняется только на клиенте после проверки isClient
  const { data: profile, isLoading, isError } = useUserProfileQuery({
    enabled: shouldFetch,
  });

  // Синхронизируем sessionStorage с результатом запроса
  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов хуков: выполняется только на клиенте после проверки isClient
  useEffect(() => {
    if (profile) {
      // Успешно получили профиль - убираем флаг неавторизованности
      setUnauthorizedFlag(false);
    }
    // При ошибке 401 флаг устанавливается в useUserProfileQuery
  }, [profile]);

  // Обработчик сообщений от других вкладок
  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов хуков: выполняется только на клиенте после проверки isClient
  const handleAuthBroadcast = useCallback((message: { type: string; userId?: string }) => {
    if (!queryClient) return;

    if (message.type === "LOGOUT") {
      // Другая вкладка вышла из аккаунта — удаляем профиль из кэша
      queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      setUnauthorizedFlag(true);
    } else if (message.type === "LOGIN") {
      // Другая вкладка вошла — обновляем профиль
      setUnauthorizedFlag(false);
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    } else if (message.type === "SESSION_REFRESH") {
      // Сессия обновлена — перезапрашиваем профиль
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    }
  }, [queryClient]);

  // Подписываемся на события от других вкладок
  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов хуков: выполняется только на клиенте после проверки isClient
  useEffect(() => {
    return subscribeToAuthBroadcast(handleAuthBroadcast);
  }, [handleAuthBroadcast]);

  // Если есть данные профиля и нет ошибки - пользователь авторизован
  const isAuthenticated = !!profile && !isError;

  // Показываем загрузку только если запрос разрешен и выполняется
  const isActuallyLoading = shouldFetch && isLoading;

  return {
    isAuthenticated,
    isLoading: isActuallyLoading,
  };
}
