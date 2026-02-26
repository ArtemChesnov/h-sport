import { Skeleton } from "@/shared/components/ui";

/**
 * Скелетон для деталки заказа.
 * Соответствует верстке [uid]/page: колонки при 1920px, заголовок 22/32/38px, отступы 873/1024.
 */
export function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col max-[1919px]:gap-12 min-[1920px]:flex-row min-[1920px]:justify-between">
      <div className="flex flex-col min-w-0 gap-6 min-[1024px]:gap-10.5">
        <Skeleton className="h-[22px] w-full max-w-80 min-[873px]:h-8 min-[1024px]:h-[38px]" />
        <div className="flex flex-col gap-4 min-[873px]:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 min-[873px]:h-16 w-full" />
          ))}
        </div>
      </div>
      <Skeleton className="w-full min-[1920px]:w-200 h-72 min-[1920px]:h-96 shrink-0 rounded-[10px]" />
    </div>
  );
}
