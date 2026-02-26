"use client";

import { useAuthCheck } from "@/shared/hooks/user/use-auth-check";
import { useEffect, useState } from "react";

export type UseAuthRequiredDialogOptions = {
  title?: string;
  description?: string;
};

export type UseAuthRequiredDialogResult = {
  authDialogOpen: boolean;
  setAuthDialogOpen: (open: boolean) => void;
  authDialogProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
  };
};

/**
 * Хук для страниц ЛК: открывает AuthRequiredDialog при неавторизованном пользователе.
 * Возвращает props для AuthRequiredDialog — рендер в вызывающем компоненте.
 */
export function useAuthRequiredDialog(
  options: UseAuthRequiredDialogOptions = {},
): UseAuthRequiredDialogResult {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthCheck();
  const shouldShowByAuth = !isAuthLoading && !isAuthenticated;
  const [userClosed, setUserClosed] = useState(false);
  const open = shouldShowByAuth && !userClosed;

  useEffect(() => {
    if (isAuthenticated) {
      queueMicrotask(() => setUserClosed(false));
    }
  }, [isAuthenticated]);

  return {
    authDialogOpen: open,
    setAuthDialogOpen: (next) => setUserClosed(!next),
    authDialogProps: {
      open,
      onOpenChange: (next) => setUserClosed(!next),
      title: options.title ?? "Войдите в аккаунт",
      description:
        options.description ??
        "Чтобы просматривать личный кабинет, необходимо войти в аккаунт или зарегистрироваться.",
    },
  };
}
