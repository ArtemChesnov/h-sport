import { Skeleton } from "@/shared/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Summary карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-muted/20 p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-muted/20 p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-muted/20 p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </div>
      </div>

      {/* Таблица */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-muted/20 p-4 space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-0 rounded-lg border border-border/50 overflow-hidden">
          <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-3 w-24" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-border/30 h-14 flex items-center gap-4 px-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-4 w-24" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
