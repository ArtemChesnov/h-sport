/**
 * Скелетон для e-commerce метрик
 */

import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function EcommerceMetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-48 mb-1" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-9 w-64 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl border shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                </div>
                <div className="h-4" />
              </div>
              <Skeleton className="h-5 w-5 rounded mt-0.5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[450px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
