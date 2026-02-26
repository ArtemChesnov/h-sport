import { Skeleton } from "@/shared/components/ui";

/**
 * Скелетон блока «Новинки» / «Бестселлеры» — единая структура:
 * ≤1280px: слайдер (≤576px — 1 карточка, >576px — 2 карточки, gap 10px);
 * >1280px: сетка 2 колонки, 4 карточки (до 1440px gap 10px, с 1440px gap 20px).
 */
export function NewProductsSkeleton() {
  return (
    <>
      <div className="xl:hidden w-full overflow-hidden mt-6 flex ml-0 min-[577px]:-ml-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 basis-full min-[577px]:basis-[calc(50%-5px)] min-[577px]:pl-2.5 min-w-0 flex flex-col"
          >
            <Skeleton className="w-full aspect-[607/1014] min-h-[500px] rounded-lg" />
            <div className="flex flex-col gap-[15px] mt-5">
              <Skeleton className="h-6 w-3/4 min-[1280px]:h-[36px]" />
              <Skeleton className="h-5 w-1/2 min-[1280px]:h-[30px]" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden xl:grid xl:grid-cols-2 xl:gap-2.5 min-[1440px]:!gap-5 w-full mt-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col min-w-0 w-full h-[800px] min-[1440px]:h-[1080px]">
            <Skeleton className="w-full flex-1 min-h-0 rounded-lg" />
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
