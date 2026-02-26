import { Skeleton } from "@/shared/components/ui/skeleton";

export default function WebVitalsLoading() {
  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      {/* Заголовок и переключатель периода */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
      </header>

      <Skeleton className="h-px w-full" />

      {/* Основные метрики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-cyan-50/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-10 w-24" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* График */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-cyan-50/20 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-[480px] w-full rounded-lg" />
      </div>

      {/* Топ страниц */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-cyan-50/20 p-4 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="rounded-lg border border-border/50 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border-b border-border/30 last:border-b-0 h-12 flex items-center gap-4 px-4">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
