/**
 * Скелетон для «Мои заказы».
 * Соответствует верстке orders-page-client и OrderCard (адаптивные отступы, колонка на мобиле).
 */
import { Skeleton } from "@/shared/components/ui/skeleton";

export function OrdersPageSkeleton() {
  return (
    <div
      className="space-y-6 min-h-100 max-[576px]:space-y-6 min-[873px]:space-y-8 min-[1024px]:space-y-10"
      data-orders-section
    >
      <div className="flex items-center gap-2 min-h-7">
        <Skeleton className="h-6 w-32 rounded-md max-[576px]:h-6 min-[873px]:h-8 min-[873px]:w-40 min-[1024px]:h-[38px] min-[1024px]:w-48" />
      </div>

      <div className="space-y-4 max-[576px]:space-y-4 min-[873px]:space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-neutral-100 bg-white p-4 max-[576px]:p-4 min-[873px]:p-6 min-[1024px]:p-10"
          >
            <div className="flex flex-col gap-4 w-full h-fit min-[873px]:flex-row min-[873px]:justify-between">
              <div className="flex flex-col gap-3 max-[576px]:gap-3 min-[873px]:gap-3.5">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-48 max-[576px]:w-40 min-[873px]:w-64 rounded-md" />
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-4 w-12 rounded-md" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-full max-w-72 rounded-md" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-4 w-40 rounded-md" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-4 w-56 rounded-md" />
                </div>
                <div className="flex flex-wrap gap-3 mt-4 min-[873px]:mt-6 min-[1024px]:mt-18.5">
                  <Skeleton className="h-14 w-full min-[769px]:w-[215px] rounded-[10px]" />
                  <Skeleton className="h-14 w-full min-[769px]:w-[215px] rounded-[10px]" />
                </div>
              </div>
              <div className="flex flex-row flex-wrap items-center justify-between gap-4 min-[873px]:flex-col min-[873px]:justify-between min-[873px]:items-end">
                <Skeleton className="h-5 w-20 rounded-md" />
                <div className="flex gap-2 max-[576px]:gap-2 min-[873px]:gap-5">
                  {[1, 2, 3].map((j) => (
                    <Skeleton
                      key={j}
                      className="w-16 h-16 max-[576px]:w-16 max-[576px]:h-16 min-[873px]:w-[140px] min-[873px]:h-[140px] min-[1841px]:w-[180px] min-[1841px]:h-[180px] rounded-[10px] shrink-0"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
