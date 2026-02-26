/**
 * Skeleton компонент для списка товаров
 */

import { ProductCardSkeleton } from "./product-card-skeleton";

interface ProductListSkeletonProps {
  count?: number;
}

export function ProductListSkeleton({ count = 12 }: ProductListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
