"use client";

import { Container, FavoritesLayout, ShopBreadcrumbs } from "@/shared/components/common";
import { FavoritesPageSkeleton } from "@/shared/components/common/skeleton";
import { useAuthCheck, useFavoritesPage } from "@/shared/hooks";
import { useRouter } from "next/navigation";
import React from "react";

export default function FavoritesPageClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthCheck();
  const {
    data: favoritesData,
    visibleFavorites,
    isLoading,
    isError,
    refetch,
    handleToggleFavorite,
  } = useFavoritesPage({ enabled: isAuthenticated });

  const hasRedirected = React.useRef(false);
  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/auth/sign-in");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <Container className="">
        <ShopBreadcrumbs />
        <FavoritesPageSkeleton variant="full" />
      </Container>
    );
  }

  // Пока нет первого ответа — показываем скелетон, чтобы не мелькал пустой блок «Избранное пусто»
  if (isLoading || favoritesData === undefined) {
    return (
      <Container className="">
        <ShopBreadcrumbs />
        <FavoritesPageSkeleton variant="full" />
      </Container>
    );
  }

  return (
    <Container className="">
      <ShopBreadcrumbs />
      <FavoritesLayout
        visibleFavorites={visibleFavorites}
        isLoading={false}
        isError={isError}
        onErrorRetry={() => refetch()}
        onToggleFavorite={handleToggleFavorite}
        renderSkeleton={() => <FavoritesPageSkeleton variant="full" />}
      />
    </Container>
  );
}
