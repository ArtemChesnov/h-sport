"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Скелетон области контента админки. Используется как fallback для Suspense при навигации.
 */
export function AdminContentSkeleton() {
  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/50 p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
        <div className="rounded-2xl border border-border/50 p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
