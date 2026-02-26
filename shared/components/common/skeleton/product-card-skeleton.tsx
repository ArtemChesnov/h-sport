import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Skeleton компонент для карточки товара.
 * Структурно идентичен ProductCard, но без контента.
 */
export function ProductCardSkeleton() {
  return (
    <div className="relative overflow-hidden h-full w-full rounded-[10px]">
      <Skeleton className="absolute inset-0 w-full h-full rounded-[10px]" />
    </div>
  );
}
