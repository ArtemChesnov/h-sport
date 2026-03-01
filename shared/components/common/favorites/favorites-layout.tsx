"use client";

import { ErrorFallbackBlock, ProductCard, StoreEmptyBlock } from "@/shared/components/common";
import { CTA } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { DTO } from "@/shared/services";
import { Heart } from "lucide-react";
import React from "react";

export type FavoritesLayoutProps = {
  /** Список избранного (уже с учётом локально скрытых) */
  visibleFavorites: DTO.FavoriteDto[];
  /** Показывать состояние загрузки */
  isLoading?: boolean;
  /** Ошибка загрузки */
  isError?: boolean;
  /** Колбэк повтора при ошибке загрузки */
  onErrorRetry?: () => void;
  /** Колбэк при снятии товара из избранного (для скрытия карточки) */
  onToggleFavorite?: (productId: number, nextIsFavorite: boolean) => void;
  /** Заголовок страницы */
  title?: string;
  /** Рендер скелетона при isLoading */
  renderSkeleton?: () => React.ReactNode;
  /** Дополнительные классы контейнера */
  className?: string;
  /** 2 — только две колонки (для ЛК); по умолчанию — адаптивная сетка 2/3/4 колонки */
  gridCols?: 2 | "responsive";
  /** Доп. кнопка в блоке ошибки (например «В личный кабинет» для /account/favorites) */
  errorSecondaryAction?: { href: string; label: string };
  /** Выставить data-account-favorites-section на контейнер (для ЛК) */
  dataAccountSection?: boolean;
};

/**
 * Layout страницы избранного (только маршрут /favorites).
 * /account/favorites рендерит свой контент через AccountLayout.
 */
export function FavoritesLayout({
  visibleFavorites,
  isLoading = false,
  isError = false,
  onErrorRetry,
  onToggleFavorite,
  title = "Избранное",
  renderSkeleton,
  className,
  gridCols = "responsive",
  errorSecondaryAction,
  dataAccountSection,
}: FavoritesLayoutProps) {
  if (isLoading && renderSkeleton) {
    return <>{renderSkeleton()}</>;
  }

  const gridClass =
    gridCols === 2
      ? "grid grid-cols-1 min-[410px]:grid-cols-2 gap-3 max-[576px]:gap-3 min-[768px]:gap-4"
      : "grid grid-cols-1 min-[410px]:grid-cols-2 gap-3 max-[576px]:gap-3 min-[768px]:gap-4 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div
      className={cn(
        "space-y-6 min-h-100 max-[576px]:space-y-6 min-[768px]:space-y-8 min-[1024px]:space-y-10 mt-8 max-[768px]:mt-0 min-[768px]:mt-12 min-[1024px]:mt-0 ",
        className
      )}
      {...(dataAccountSection ? { "data-account-favorites-section": true } : {})}
    >
      <div className="flex items-center gap-2 min-h-7">
        <h1 className="text-[22px] leading-[100%] font-semibold max-[576px]:text-[22px] min-[768px]:text-[32px] min-[1024px]:text-[38px]">
          {title}
        </h1>
      </div>

      {isError && (
        <ErrorFallbackBlock
          title="Не удалось загрузить избранное"
          description="Попробуйте обновить страницу или зайти позже."
          onRetry={onErrorRetry ?? (() => window.location.reload())}
          secondaryAction={errorSecondaryAction}
          minHeight="40vh"
        />
      )}

      {!isError && visibleFavorites.length === 0 && (
        <StoreEmptyBlock
          title="Избранное пусто"
          description="Добавьте товары в избранное, чтобы они появились здесь"
          icon={Heart}
          action={{ href: "/catalog", label: CTA.GO_TO_CATALOG }}
        />
      )}

      {!isError && visibleFavorites.length > 0 && (
        <div className={gridClass}>
          {visibleFavorites.map((favorite, index) => (
            <div key={favorite.productId} className="w-full">
              <ProductCard
                product={favorite.product}
                variant="favorites"
                onToggleFavorite={onToggleFavorite}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
