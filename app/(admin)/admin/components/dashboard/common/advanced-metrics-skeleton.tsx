/**
 * Скелетон для расширенных метрик
 */

import { Card, CardContent, CardHeader, Skeleton } from "@/shared/components/ui";
import { METRICS_CONSTANTS } from "@/shared/constants";

export function AdvancedMetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-3 w-56" />
      </div>

      {/* Топ категорий и товаров */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <div>
          <Skeleton className="h-4 w-24 mb-4" />
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-3.5 rounded" />
              </div>
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: METRICS_CONSTANTS.TOP_ITEMS_COUNT }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Skeleton className="h-4 w-20 mb-4" />
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-3.5 rounded" />
              </div>
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: METRICS_CONSTANTS.TOP_ITEMS_COUNT }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Пользователи */}
      <div>
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                </div>
                <Skeleton className="h-9 w-24" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Доставка и оплата */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Skeleton className="h-3 w-56" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
            <Skeleton className="h-3 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
