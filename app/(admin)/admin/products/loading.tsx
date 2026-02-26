import { Skeleton } from "@/shared/components/ui/skeleton";

export default function AdminProductsLoading() {
  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      {/* Breadcrumbs */}
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Заголовок */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40" />
      </header>

      <Skeleton className="h-px w-full" />

      {/* Фильтры */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-teal-50/20 p-4">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Таблица товаров */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-teal-50/20 shadow-sm">
        <div className="p-4 pb-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="px-4 pb-4">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24 ml-auto" />
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="border-b border-border/30 last:border-b-0 h-14 flex items-center gap-4 px-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-4 w-10" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <div className="flex gap-2 ml-auto">
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border/50 p-4 flex justify-center gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}
