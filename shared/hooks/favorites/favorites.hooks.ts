/**
 * Хуки для работы с избранным.
 *
 * Best practices:
 * 1. Один QueryKey для всех подписчиков
 * 2. Оптимистичные обновления в onMutate
 * 3. Замена данных из ответа сервера в onSuccess (без invalidate!)
 * 4. Откат при ошибке в onError
 */

"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { DTO } from "@/shared/services";
import { FAVORITES_CLIENT, fetchFavorites } from "@/shared/services";
import { useAuthCheck } from "../user/use-auth-check";

/**
 * QueryKey для избранного.
 */
export const FAVORITES_QUERY_KEY = ["shop", "favorites"] as const;

type FavoritesResponse = DTO.FavoritesResponseDto;

/**
 * Получить список избранного.
 */
export function useFavoritesQuery<TData = FavoritesResponse>(
  options?: Omit<
    UseQueryOptions<FavoritesResponse, Error, TData>,
    "queryKey" | "queryFn" | "retry"
  >,
) {
  return useQuery<FavoritesResponse, Error, TData>({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: fetchFavorites,
    retry: (failureCount, error) => {
      // Не ретраим при 401 (неавторизован) или 403 (доступ запрещен)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        const status = axiosError.response?.status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
    ...options,
  });
}

/**
 * Добавить в избранное.
 */
export function useAddFavoriteMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => FAVORITES_CLIENT.addFavorite(productId),

    // 1. Оптимистичное обновление — мгновенная реакция UI
    onMutate: async (productId: number) => {
      // Отменяем исходящие запросы, чтобы не перезаписали оптимистичное состояние
      await qc.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });

      // Сохраняем текущее состояние для отката
      const previousData = qc.getQueryData<FavoritesResponse>(FAVORITES_QUERY_KEY);

      // Оптимистично добавляем товар
      if (previousData) {
        qc.setQueryData<FavoritesResponse>(FAVORITES_QUERY_KEY, {
          ...previousData,
          items: [
            ...previousData.items,
            { productId, product: { id: productId } } as DTO.FavoriteDto,
          ],
        });
      }

      return { previousData };
    },

    // 2. При успехе — заменяем кэш данными сервера (они точные)
    onSuccess: (data) => {
      // Сервер вернул актуальный список — устанавливаем его как источник правды
      qc.setQueryData<FavoritesResponse>(FAVORITES_QUERY_KEY, data);
    },

    // 3. При ошибке — откатываем к предыдущему состоянию
    onError: (_err, _productId, context) => {
      if (context?.previousData) {
        qc.setQueryData<FavoritesResponse>(FAVORITES_QUERY_KEY, context.previousData);
      }
    },
  });
}

/**
 * Удалить из избранного.
 */
export function useRemoveFavoriteMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => FAVORITES_CLIENT.removeFavorite(productId),

    // 1. Оптимистичное обновление
    onMutate: async (productId: number) => {
      await qc.cancelQueries({ queryKey: FAVORITES_QUERY_KEY });

      const previousData = qc.getQueryData<FavoritesResponse>(FAVORITES_QUERY_KEY);

      if (previousData) {
        qc.setQueryData<FavoritesResponse>(FAVORITES_QUERY_KEY, {
          ...previousData,
          items: previousData.items.filter((item) => item.productId !== productId),
        });
      }

      return { previousData };
    },

    // 2. При успехе — заменяем данными сервера
    onSuccess: (data) => {
      qc.setQueryData<FavoritesResponse>(FAVORITES_QUERY_KEY, data);
    },

    // 3. При ошибке — откат
    onError: (_err, _productId, context) => {
      if (context?.previousData) {
        qc.setQueryData<FavoritesResponse>(FAVORITES_QUERY_KEY, context.previousData);
      }
    },
  });
}

/**
 * Счётчик избранного для Header.
 *
 * Использует тот же queryKey, что и useFavoritesQuery,
 * поэтому автоматически получает обновления при мутациях.
 *
 * select возвращает примитив (number), что гарантирует ререндер
 * при любом изменении количества избранных товаров.
 */
/**
 * Счётчик избранного для Header.
 * Использует кэш из useFavoritesQuery для избежания лишних запросов.
 */
export function useFavoritesCount() {
  const { isAuthenticated } = useAuthCheck();

  const { data: count, isLoading } = useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: fetchFavorites,
    enabled: isAuthenticated,
    select: (data) => data?.items?.length ?? 0,
    // Используем кэш вместо refetch при монтировании (Header рендерится на каждой странице)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 минут - данные избранного редко меняются без действий пользователя
  });

  if (isLoading) {
    return null;
  }

  // Если пользователь не авторизован, запрос отключен и count будет undefined
  // В этом случае возвращаем 0
  return count ?? 0;
}
