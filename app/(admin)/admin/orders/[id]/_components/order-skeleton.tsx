"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Separator,
  Skeleton,
} from "@/shared/components/ui";

/**
 * Скелетон для страницы заказа (loading state)
 */
export function OrderSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Заголовок */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </header>

      <Separator />

      <div className="space-y-6">
        {/* Форма редактирования */}
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-indigo-50/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-3 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-indigo-100/50 bg-gradient-to-br from-indigo-50/30 to-white p-4 space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>
            <Separator />
            <div className="rounded-lg border border-blue-100/50 bg-gradient-to-br from-blue-50/30 to-white p-4 space-y-4">
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <Separator />
            <div className="rounded-lg border border-emerald-100/50 bg-gradient-to-br from-emerald-50/30 to-white p-4 space-y-4">
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Skeleton className="h-9 w-40 ml-auto" />
          </CardFooter>
        </Card>

        {/* Состав заказа */}
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-3 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg border border-border/40 p-4">
                  <Skeleton className="h-24 w-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
