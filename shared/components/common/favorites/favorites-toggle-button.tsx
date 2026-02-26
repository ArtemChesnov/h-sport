/**
 * Кнопка "добавить в избранное".
 *
 * Использует оптимистичные обновления из хуков мутаций.
 * Локальное состояние НЕ используется — состояние берётся из React Query кэша.
 */

"use client";

import { AuthRequiredDialog } from "@/shared/components/common";
import { FavoritesFilledIcon, FavoritesIcon } from "@/shared/components/icons";
import {
    useAddFavoriteMutation,
    useAuthCheck,
    useFavoritesQuery,
    useRemoveFavoriteMutation,
} from "@/shared/hooks";
import { cn } from "@/shared/lib";
import React from "react";

type FavoriteToggleButtonProps = {
  productId: number;
  className?: string;
  size?: "sm" | "md";
  /**
   * Опциональный колбэк для внешних эффектов (например, скрыть карточку в избранном).
   * nextIsFavorite — состояние ПОСЛЕ клика.
   */
  onToggle?: (productId: number, nextIsFavorite: boolean) => void;
};

export function FavoriteToggleButton({
  productId,
  className,
  size = "sm",
  onToggle,
}: FavoriteToggleButtonProps) {
  const [mounted, setMounted] = React.useState(false);
  const { isAuthenticated } = useAuthCheck();
  const { data, isLoading } = useFavoritesQuery({
    enabled: isAuthenticated,
  });
  const addFavorite = useAddFavoriteMutation();
  const removeFavorite = useRemoveFavoriteMutation();
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

  // Отслеживаем завершение гидратации для предотвращения hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Состояние берём напрямую из кэша React Query
  // Оптимистичные обновления происходят в хуках мутаций
  const items = data?.items ?? [];
  const isFavorite = items.some((x) => x.productId === productId);
  const [shouldPop, setShouldPop] = React.useState(false);

  React.useEffect(() => {
    if (!shouldPop) return;
    const t = setTimeout(() => setShouldPop(false), 350);
    return () => clearTimeout(t);
  }, [shouldPop]);

  // До гидратации кнопка всегда enabled (как на сервере), после — учитываем isLoading
  const isBusy = mounted && (isLoading || addFavorite.isPending || removeFavorite.isPending);
  // На мобилках иконка избранного 28×28, на десктопе — по size
  const buttonSize =
    size === "md" ? "h-7 w-7 md:h-10 md:w-10" : "h-7 w-7 md:h-9 md:w-9";

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (isBusy) return;

    // Если пользователь не авторизован, показываем модалку
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }

    const nextIsFavorite = !isFavorite;
    setShouldPop(true);

    onToggle?.(productId, nextIsFavorite);

    // Мутация сама обновит кэш оптимистично в onMutate
    if (nextIsFavorite) {
      addFavorite.mutate(productId);
    } else {
      removeFavorite.mutate(productId);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy}
        aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        className={cn(
          "group relative inline-flex cursor-pointer items-center justify-center",
          "transition-transform duration-150",
          "hover:scale-105 active:scale-95",
          "disabled:opacity-60 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          buttonSize,
          className,
        )}
      >
        <span className={cn("inline-flex", shouldPop && "animate-pop")}>
          {isFavorite ? (
            <FavoritesFilledIcon
              className="h-full w-full"
              pathClassName="fill-[#EB6081]"
            />
          ) : (
            <FavoritesIcon
              className="h-full w-full"
              pathClassName="stroke-[#EB6081]"
            />
          )}
        </span>
      </button>

      <AuthRequiredDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        title="Войдите в аккаунт"
        description="Чтобы добавлять товары в избранное, необходимо войти в аккаунт или зарегистрироваться."
      />
    </>
  );
}
