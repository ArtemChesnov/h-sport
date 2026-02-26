"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Скелетон для страницы товара.
 * Соответствует новой вёрстке ProductSlugClient.
 */
export function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-[1860px] px-4 lg:px-6 pb-20">
      {/* Скелетон хлебных крошек */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="mt-[60px] flex flex-col lg:flex-row lg:justify-between gap-10">
        {/* Галерея — фиксированные размеры */}
        <div className="w-full lg:w-auto lg:shrink-0">
          {/* Десктоп: ряд 940px; миниатюры адаптивные, главное фото 940px по высоте */}
          <div className="hidden lg:flex gap-5 h-[940px] w-full">
            {/* Миниатюры — адаптивная ширина, видно 3 */}
            <div className="flex flex-col gap-5 w-[min(290px,25%)] min-w-[140px] shrink-0 h-full overflow-hidden">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full aspect-[290/300] shrink-0" />
              ))}
            </div>
            {/* Главное изображение — flex-1, высота 940px */}
            <Skeleton className="flex-1 min-w-0 max-w-[880px] h-full" />
          </div>

          {/* Мобайл: главное фото сверху, миниатюры снизу */}
          <div className="flex flex-col gap-3 lg:hidden">
            <Skeleton className="w-full aspect-[880/940]" />
            <div className="flex gap-3 py-1">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Информация — max 640px */}
        <div className="flex flex-col gap-[52px] w-full lg:max-w-[640px] lg:min-w-[320px]">
          {/* Название и цена */}
          <div className="flex flex-col gap-6">
            <Skeleton className="h-[57px] w-3/4" />
            <Skeleton className="h-[42px] w-1/3" />
          </div>

          {/* Варианты */}
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              {/* Цвет */}
              <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-[3px] w-full" />
                <div className="flex gap-3.5">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-10 h-10 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Размер */}
              <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-[3px] w-full" />
                <div className="flex gap-3.5">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="w-10 h-[34px] rounded-[10px]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Кнопка корзины */}
            <Skeleton className="h-14 w-full rounded-[10px]" />
          </div>

          {/* Табы */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 flex-1" />
              ))}
            </div>
            <Skeleton className="h-[2px] w-full" />
            <Skeleton className="h-24 w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
