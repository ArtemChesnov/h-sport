"use client";

import { subscribeToAuthBroadcast } from "@/shared/lib/auth/auth-broadcast";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { AUTH_ME_QUERY_KEY, useAuthMeQuery } from "./use-auth-me";
import { USER_PROFILE_QUERY_KEY } from "./user-profile.hooks";

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
 * Использует GET /api/auth/me (только проверка сессии, без загрузки профиля из БД).
 * Cookie с httpOnly: true недоступна в JavaScript, поэтому проверяем через API.
 *
 * SSR-safe: на сервере возвращает { isAuthenticated: false, isLoading: true }
 *
 * @returns {isAuthenticated: boolean, isLoading: boolean}
 */
export function useAuthCheck() {
  const isClient = typeof window !== "undefined";

  if (!isClient) {
    return {
      isAuthenticated: false,
      isLoading: true,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов: ветка только на клиенте (isClient)
  const queryClient = useQueryClient();
  const cachedMe = queryClient.getQueryData(AUTH_ME_QUERY_KEY);
  const hasValidMe = cachedMe && typeof cachedMe === "object" && "id" in cachedMe;
  const shouldFetch = !hasValidMe;

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов: ветка только на клиенте (isClient)
  const {
    data: user,
    isLoading,
    isError,
  } = useAuthMeQuery({
    enabled: shouldFetch,
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов: ветка только на клиенте (isClient)
  useEffect(() => {
    if (user) {
      setUnauthorizedFlag(false);
    }
  }, [user]);

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов: ветка только на клиенте (isClient)
  const handleAuthBroadcast = useCallback(
    (message: { type: string; userId?: string }) => {
      if (!queryClient) return;

      if (message.type === "LOGOUT") {
        queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY });
        queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEY });
        setUnauthorizedFlag(true);
      } else if (message.type === "LOGIN") {
        setUnauthorizedFlag(false);
        queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      } else if (message.type === "SESSION_REFRESH") {
        queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      }
    },
    [queryClient]
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов: ветка только на клиенте (isClient)
  useEffect(() => {
    return subscribeToAuthBroadcast(handleAuthBroadcast);
  }, [handleAuthBroadcast]);

  const isAuthenticated = !!user && !isError;
  const isActuallyLoading = shouldFetch && isLoading;

  return {
    isAuthenticated,
    isLoading: isActuallyLoading,
  };
}
