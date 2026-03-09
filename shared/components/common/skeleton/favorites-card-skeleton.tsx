import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Скелетон карточки избранного.
 * Повторяет структуру ProductCard (variant="favorites"): блок изображения aspect-3/4 + текст (название, цена).
 */
export function FavoritesCardSkeleton() {
  return (
    <div className="relative bg-neutral-100 min-w-0">
      <div className="relative aspect-[3/4] w-full min-h-0 overflow-hidden rounded-[10px]">
        <Skeleton className="absolute inset-0 h-full w-full rounded-[10px]" />
      </div>
      <div className="mt-3 flex flex-col gap-2 min-w-0">
        <Skeleton className="h-9 w-full max-w-[85%] rounded-[10px]" />
        <Skeleton className="h-8 w-24 rounded-[10px]" />
      </div>
    </div>
  );
}
