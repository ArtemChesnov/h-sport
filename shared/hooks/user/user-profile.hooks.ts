
"use client";

import { DTO, USER_CLIENT } from "@/shared/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const USER_PROFILE_QUERY_KEY = ["user", "profile"] as const;

/**
 * Хук для получения профиля пользователя.
 * SSR-safe: на сервере возвращает { data: undefined, isLoading: true, isError: false, error: null }
 */
export function useUserProfileQuery(options?: {
  enabled?: boolean;
}): {
  data: DTO.UserProfileDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const isClient = typeof window !== "undefined";

  // SSR: возвращаем mock результат чтобы не вызывать useQueryClient на сервере
  // isLoading: true чтобы на сервере и клиенте был одинаковый рендеринг (показываем Spinner)
  if (!isClient) {
    return {
      data: undefined,
      isLoading: true, // true чтобы избежать hydration mismatch
      isError: false,
      error: null,
    };
  }

  // Клиентская часть - безопасно использовать хуки (условие isClient гарантирует выполнение только на клиенте)
  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов хуков: ветка выполняется только на клиенте после проверки isClient
  const query = useQuery<DTO.UserProfileDto>({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => USER_CLIENT.fetchUserProfile(),
    refetchOnWindowFocus: false, // Отключаем автоматический refetch при фокусе окна
    refetchOnMount: false, // Отключаем автоматический refetch при монтировании - используем данные из кеша
    refetchOnReconnect: false, // Отключаем автоматический refetch при переподключении
    staleTime: 5 * 60 * 1000, // Данные считаются свежими 5 минут
    retry: (failureCount, error) => {
      // Не ретраим при 401 (неавторизован) или 403 (доступ запрещен)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        const status = axiosError.response?.status;
        if (status === 401 || status === 403) {
          // НЕ устанавливаем null в кэш — это блокировало бы будущие запросы после логина
          // Просто не ретраим запрос
          return false;
        }
      }
      return failureCount < 2;
    },
    // Примечание: onError был удален из React Query v5
    // Обработка ошибок теперь должна быть на уровне каждого запроса
    enabled: options?.enabled !== false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
  };
}

/**
 * Хук для обновления профиля пользователя.
 * SSR-safe: на сервере возвращает no-op mutation
 */
export function useUpdateUserProfileMutation() {
  const isClient = typeof window !== "undefined";

  // SSR: возвращаем минимальный mock mutation (только реально используемые поля)
  if (!isClient) {
    const noop = () => {};
    return {
      mutate: noop as never,
      mutateAsync: (() => Promise.resolve({} as DTO.UserProfileDto)) as never,
      isPending: false,
      isError: false,
      isSuccess: false,
      error: null,
      data: undefined,
      reset: noop as never,
      status: "idle" as const,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов хуков: ветка только на клиенте (isClient)
  const queryClient = useQueryClient();

  // eslint-disable-next-line react-hooks/rules-of-hooks -- условный вызов хуков: ветка только на клиенте (isClient)
  return useMutation<DTO.UserProfileDto, Error, DTO.UserProfileUpdateDto>({
    mutationFn: (payload) => USER_CLIENT.updateUserProfile(payload),
    onSuccess: (data) => {
      // Обновляем кэш профиля
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, data);
    },
  });
}

