/**
 * Скелетон для «Моя учётная запись».
 * Соответствует верстке ЛК: брейкпоинты 872/873 (layout), 1024, 1090; колонка при 1090px, кнопки в столбик при ≤576px.
 */
import { Skeleton } from "@/shared/components/ui/skeleton";

export function AccountPageSkeleton() {
  return (
    <div className="space-y-0">
      {/* Персональная информация */}
      <div>
        <Skeleton className="h-7 w-64 rounded-md max-[576px]:h-6 max-[576px]:w-48 min-[873px]:h-8 min-[873px]:w-72 min-[1024px]:h-[38px] min-[1024px]:w-80" />
        <Skeleton className="h-0.75 w-full my-4 min-[873px]:my-6 min-[1024px]:my-8 rounded-full bg-primary/20" />
        <div className="flex justify-between max-[1440px]:gap-8 max-[1024px]:flex-col max-[1090px]:gap-6">
          <Skeleton className="h-12 max-w-[313px] w-full shrink-0 rounded-md max-[1090px]:max-w-full" />
          <div className="flex flex-col items-start max-[576px]:items-stretch max-[1090px]:ml-0 max-[1440px]:ml-auto ml-33 w-full min-w-0">
            <div className="flex flex-wrap gap-4 w-full max-[576px]:flex-col max-[576px]:gap-4 min-[873px]:gap-5">
              <div className="flex flex-col gap-3 flex-1 min-w-0 max-[576px]:w-full min-[873px]:gap-4">
                <Skeleton className="h-4 w-12 rounded-md" />
                <Skeleton className="h-11 w-full rounded-[10px]" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-11 w-full min-w-[215px] rounded-[10px]" />
              </div>
              <div className="flex flex-col gap-3 flex-1 min-w-0 max-[576px]:w-full min-[873px]:gap-4">
                <Skeleton className="h-4 w-14 rounded-md" />
                <Skeleton className="h-11 w-full rounded-[10px]" />
                <Skeleton className="h-4 w-12 rounded-md" />
                <Skeleton className="h-11 w-full rounded-[10px]" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6 max-[576px]:flex-col max-[576px]:w-full max-[576px]:gap-4 min-[873px]:gap-5 min-[873px]:mt-8 min-[1024px]:mt-10">
              <Skeleton className="h-14 w-53.75 rounded-[10px] max-[576px]:w-full" />
              <Skeleton className="h-14 w-53.75 rounded-[10px] max-[576px]:w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Адрес: при 1090px колонка; Дом, Подъезд, Квартира — в одну строку */}
      <div className="mt-4 min-[873px]:mt-6 min-[1024px]:mt-5">
        <Skeleton className="h-7 w-24 rounded-md max-[576px]:h-6 min-[873px]:h-8 min-[1024px]:h-[38px] min-[1024px]:w-28" />
        <Skeleton className="h-0.75 w-full my-4 min-[873px]:my-6 min-[1024px]:my-8 rounded-full bg-primary/20" />
        <div className="flex justify-between max-[1440px]:gap-8 max-[1024px]:flex-col max-[1090px]:gap-6">
          <Skeleton className="h-12 max-w-[313px] w-full shrink-0 rounded-md max-[1090px]:max-w-full" />
          <div className="flex flex-col items-start max-[576px]:items-stretch max-[1090px]:ml-0 max-[1440px]:ml-auto ml-33 w-full min-w-0">
            <div className="flex flex-col gap-3 w-full max-[576px]:gap-3 min-[873px]:gap-4 min-[1091px]:grid min-[1091px]:grid-cols-2 min-[1091px]:gap-5 min-[1091px]:items-start">
              <div className="flex flex-col gap-2 min-[1091px]:row-start-1 min-[1091px]:col-start-1">
                <Skeleton className="h-4 w-14 rounded-md" />
                <Skeleton className="h-11 w-full rounded-[10px]" />
              </div>
              <div className="flex flex-col gap-2 min-[1091px]:row-start-1 min-[1091px]:col-start-2">
                <Skeleton className="h-4 w-10 rounded-md" />
                <Skeleton className="h-11 w-full rounded-[10px]" />
              </div>
              <div className="flex flex-col gap-2 min-[1091px]:row-start-2 min-[1091px]:col-start-1">
                <Skeleton className="h-4 w-12 rounded-md" />
                <Skeleton className="h-11 w-full rounded-[10px]" />
              </div>
              <div className="flex flex-col gap-2 min-[1091px]:row-start-2 min-[1091px]:col-start-2">
                <div className="flex gap-5">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-8 rounded-md" />
                    <Skeleton className="h-11 w-full rounded-[10px]" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-16 rounded-md" />
                    <Skeleton className="h-11 w-full rounded-[10px]" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-14 rounded-md" />
                    <Skeleton className="h-11 w-full rounded-[10px]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6 max-[576px]:flex-col max-[576px]:w-full max-[576px]:gap-4 min-[873px]:gap-5 min-[873px]:mt-8 min-[1024px]:mt-10">
              <Skeleton className="h-14 w-53.75 rounded-[10px] max-[576px]:w-full" />
              <Skeleton className="h-14 w-53.75 rounded-[10px] max-[576px]:w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
