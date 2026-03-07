"use client";

import React from "react";
import { useFavoritesQuery } from "./favorites.hooks";

export type UseFavoritesPageOptions = {
  /** Включить запрос (например, только для авторизованных на /favorites) */
  enabled?: boolean;
};

/** Страница избранного: запрос, hiddenIds, toggle. /favorites и /account/favorites. */
export function useFavoritesPage(options?: UseFavoritesPageOptions) {
  const { data, isLoading, isError, refetch } = useFavoritesQuery({
    enabled: options?.enabled ?? true,
  });
  const favorites = data?.items ?? [];
  const [hiddenIds, setHiddenIds] = React.useState<number[]>([]);

  const handleToggleFavorite = React.useCallback((productId: number, nextIsFavorite: boolean) => {
    if (!nextIsFavorite) {
      setHiddenIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
    }
  }, []);

  const visibleFavorites = favorites.filter((fav) => !hiddenIds.includes(fav.productId));

  return {
    data,
    favorites,
    visibleFavorites,
    isLoading,
    isError,
    refetch,
    handleToggleFavorite,
  };
}
