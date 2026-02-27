/**
 * Скелетон страницы избранного.
 * Используется на /favorites и /account/favorites.
 */
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { FavoritesCardSkeleton } from "./favorites-card-skeleton";

type FavoritesPageSkeletonProps = {
  /** Вариант: full — 8 карточек, адаптивная сетка; account — 4 карточки, 2 колонки */
  variant?: "full" | "account";
  className?: string;
};

export function FavoritesPageSkeleton({ variant = "full", className }: FavoritesPageSkeletonProps) {
  const cardCount = variant === "account" ? 4 : 8;
  return (
    <div
      className={cn(
        "min-h-100",
        variant === "account"
          ? "space-y-6 max-[576px]:space-y-6 min-[873px]:space-y-8 min-[1024px]:space-y-10"
          : "space-y-6 max-[576px]:space-y-6 min-[768px]:space-y-8 min-[1024px]:space-y-10 mt-8 min-[768px]:mt-12 min-[1024px]:mt-15",
        className
      )}
      data-account-favorites-section={variant === "account" ? true : undefined}
    >
      <div className="flex items-center gap-2 min-h-7">
        <Skeleton
          className={
            variant === "account"
              ? "h-6 w-32 rounded-md max-[576px]:h-6 min-[873px]:h-8 min-[873px]:w-40 min-[1024px]:h-[38px] min-[1024px]:w-48"
              : "h-6 w-32 rounded-[10px] max-[576px]:h-6 min-[768px]:h-8 min-[1024px]:h-[38px] min-[1024px]:w-40"
          }
        />
      </div>
      <div
        className={
          variant === "account"
            ? "grid grid-cols-1 min-[410px]:grid-cols-2 gap-3 max-[576px]:gap-3 min-[873px]:gap-4"
            : "grid grid-cols-1 min-[410px]:grid-cols-2 gap-3 max-[576px]:gap-3 min-[768px]:gap-4 lg:grid-cols-3 xl:grid-cols-4"
        }
      >
        {Array.from({ length: cardCount }, (_, i) => (
          <div
            key={i}
            className={
              variant === "account"
                ? "rounded-lg border border-neutral-100 bg-white overflow-hidden"
                : undefined
            }
          >
            <FavoritesCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
