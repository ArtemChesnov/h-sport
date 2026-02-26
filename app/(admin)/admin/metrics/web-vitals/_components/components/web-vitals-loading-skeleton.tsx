/**
 * Скелетон загрузки для дашборда Web Vitals
 */

import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function WebVitalsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="inline-flex items-center gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Карточки метрик */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-12" />
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                </div>
                <Skeleton className="h-3 w-32 mt-1" />
              </div>
              <Skeleton className="h-5 w-5 rounded ml-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* График */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[520px] w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Топ страниц */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Детальная статистика */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
