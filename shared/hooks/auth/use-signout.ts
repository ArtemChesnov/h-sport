
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signout } from "@/shared/services";
import { USER_PROFILE_QUERY_KEY } from "../user/user-profile.hooks";
import { UNAUTHORIZED_FLAG_KEY } from "../user/use-auth-check";
import { broadcastLogout } from "@/shared/lib/auth/auth-broadcast";

/**
 * Хук для выхода пользователя из системы
 */
export function useSignout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signout,
    onSuccess: () => {
      // Устанавливаем null в кэш профиля, чтобы предотвратить автоматические запросы
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, null);
      // Отменяем все активные запросы профиля
      queryClient.cancelQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      // Очищаем все данные пользователя из кэша
      queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      queryClient.removeQueries({ queryKey: ["shop", "favorites"] });
      queryClient.removeQueries({ queryKey: ["shop", "cart"] });
      queryClient.removeQueries({ queryKey: ["shop", "orders"] });

      // Очищаем флаг неавторизованности из sessionStorage
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem(UNAUTHORIZED_FLAG_KEY);
        } catch {
          // Игнорируем ошибки sessionStorage
        }
      }

      // Уведомляем другие вкладки о выходе
      broadcastLogout();

      // Принудительно перезагружаем страницу для очистки всех состояний
      window.location.href = "/";
    },
  });
}
