import { Skeleton } from "@/shared/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      {/* Заголовок */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-32" />
      </header>

      <Skeleton className="h-px w-full" />

      {/* Поиск */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-violet-50/20 p-4">
        <Skeleton className="h-10 w-64" />
      </div>

      {/* Таблица пользователей */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-white via-white to-violet-50/20 shadow-sm">
        <div className="p-4 pb-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="px-4 pb-4">
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="border-b border-border/30 last:border-b-0 h-14 flex items-center gap-4 px-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8 ml-auto" />
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
