"use client";

import { AuthRequiredDialog, FavoritesLayout } from "@/shared/components/common";
import { FavoritesPageSkeleton } from "@/shared/components/common/skeleton";
import { useAuthCheck, useFavoritesPage } from "@/shared/hooks";
import { useAuthRequiredDialog } from "@/shared/hooks/account/use-auth-required-dialog";

/**
 * Вкладка «Избранное» в ЛК: контент через общий FavoritesLayout.
 */
export function FavoritesPageClient() {
  const { isLoading: isAuthLoading } = useAuthCheck();
  const {
    visibleFavorites,
    isLoading,
    isError,
    refetch,
    handleToggleFavorite,
  } = useFavoritesPage();
  const { authDialogProps } = useAuthRequiredDialog({
    description:
      "Чтобы просматривать избранное, необходимо войти в аккаунт или зарегистрироваться.",
  });

  return (
    <>
      {isAuthLoading || isLoading ? (
        <FavoritesPageSkeleton variant="account" />
      ) : (
        <FavoritesLayout
          visibleFavorites={visibleFavorites}
          isLoading={false}
          isError={isError}
          onErrorRetry={() => refetch()}
          onToggleFavorite={handleToggleFavorite}
          title="Избранное"
          gridCols={2}
          errorSecondaryAction={{ href: "/account", label: "В личный кабинет" }}
          dataAccountSection
          className="min-h-100"
        />
      )}
      <AuthRequiredDialog {...authDialogProps} />
    </>
  );
}
