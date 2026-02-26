import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Только контент скелетона (слайдер + сетка), без section/h2.
 * Используется внутри YouMightLikeBlock при isLoading.
 */
export function YouMightLikeSkeletonContent() {
  return (
    <>
      <div className="xl:hidden w-full overflow-hidden flex ml-0 min-[577px]:-ml-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 basis-full min-[577px]:basis-[calc(50%-5px)] min-[577px]:pl-2.5 min-w-0"
          >
            <Skeleton className="w-full min-w-0 h-[500px] min-[769px]:h-[800px] min-[1440px]:h-[1080px] rounded-lg" />
          </div>
        ))}
      </div>
      <div className="hidden xl:grid xl:grid-cols-2 xl:gap-4 min-[1600px]:!grid-cols-4 min-[1600px]:!gap-6 w-full min-w-0 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col min-w-0 w-full">
            <Skeleton className="w-full aspect-[3/4] min-h-0 rounded-lg" />
            <div className="flex flex-col gap-[15px] mt-5 shrink-0">
              <Skeleton className="h-[36px] w-3/4" />
              <Skeleton className="h-[30px] w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Полный скелетон блока «Вам понравится» (section + заголовок + контент).
 * Для loading страницы товара — резервирует место и убирает скачок при появлении блока.
 */
export function YouMightLikeSkeleton() {
  return (
    <section
      className="mt-[160px] max-[1440px]:mt-[100px]"
      aria-label="Вам понравится"
    >
      <h2 className="text-[38px] font-light leading-[120%] mb-8">Вам понравится</h2>
      <YouMightLikeSkeletonContent />
    </section>
  );
}
