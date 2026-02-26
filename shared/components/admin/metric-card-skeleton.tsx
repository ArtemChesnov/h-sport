"use client";

/**
 * Скелетон для карточки метрики
 * Поддерживает все варианты отображения
 */

import { Card, CardContent, CardHeader, Skeleton } from "@/shared/components/ui";

export interface MetricCardSkeletonProps {
  /** Показывать иконку и инфо */
  withIcon?: boolean;
  /** Показывать описание */
  withDescription?: boolean;
  /** Показывать индикатор сравнения */
  withComparison?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
}

export function MetricCardSkeleton({
  withIcon = true,
  withDescription = true,
  withComparison = false,
  className,
}: MetricCardSkeletonProps) {
  return (
    <Card className={`rounded-2xl border shadow-sm ${className ?? ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between space-y-0">
          {withIcon && (
            <div className="flex items-center gap-1.5 mb-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
          )}
          {withComparison && <Skeleton className="h-4 w-4 rounded ml-auto" />}
        </div>
        <Skeleton className="h-9 w-24" />
      </CardHeader>
      {withDescription && (
        <CardContent className="pt-0">
          <Skeleton className="h-3 w-32" />
        </CardContent>
      )}
    </Card>
  );
}
