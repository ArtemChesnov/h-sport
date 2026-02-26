/**
 * Скелетон для бизнес-метрик
 */

import { Card, CardContent, CardHeader, Skeleton } from "@/shared/components/ui";
import { MetricCardSkeleton, MetricsSection } from "@/shared/components/admin";

export function BusinessMetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-3 w-64" />
      </div>

      {/* Брошенные корзины - скелетон */}
      <MetricsSection title="Брошенные корзины">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </MetricsSection>

      {/* Клиенты и LTV - скелетон */}
      <div>
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-56 mb-4" />
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

      {/* Промокоды - скелетон */}
      <div>
        <Skeleton className="h-4 w-48 mb-4" />
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                </div>
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="text-right ml-4">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Размеры и цвета - скелетон */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3.5 w-3.5 rounded" />
              </div>
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                  <div key={j} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <Skeleton className="h-4 w-24" />
                    <div className="text-right">
                      <Skeleton className="h-4 w-12 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Комбинации - скелетон */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3.5 w-3.5 rounded" />
          </div>
          <Skeleton className="h-3 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Skeleton className="h-3 w-6 mb-1" />
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Топ товары в брошенных корзинах - скелетон */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3.5 w-3.5 rounded" />
          </div>
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
