/**
 * Скелетон загрузки для дашборда метрик
 */

import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function MetricsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-32 mb-1" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="inline-flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-8 w-14 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Графики */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[320px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Методы и медленные запросы */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/20">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="text-center space-y-1 w-full">
                    <Skeleton className="h-7 w-16 mx-auto" />
                    <Skeleton className="h-3 w-12 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
