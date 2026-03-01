"use client";

import { fetchAuthMe } from "@/shared/services";
import { useQuery } from "@tanstack/react-query";

/** Ключ кэша для GET /api/auth/me (проверка авторизации без загрузки профиля) */
export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

/**
 * Запрос к /api/auth/me — только проверка сессии, без загрузки профиля из БД.
 * Используется в useAuthCheck() для хедера и страниц, где нужен только флаг "залогинен ли".
 */
export function useAuthMeQuery(options?: { enabled?: boolean }) {
  const isClient = typeof window !== "undefined";

  if (!isClient) {
    return {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов: ветка только на клиенте (isClient)
  const query = useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: fetchAuthMe,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const status =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
    enabled: options?.enabled !== false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
  };
}
