import { ORDER_LABEL_CLASS } from "@/shared/constants";
import {
  SUMMARY_CARD_CONTAINER_CLASS,
  SUMMARY_CARD_TITLE_CLASS,
} from "@/shared/constants/ui/summary-card";
import { Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

/**
 * Скелетон для деталки заказа.
 * Повторяет верстку [uid]/page: левая колонка (заголовок, # и статус, блоки Получатель/Контакты/Адрес/Доставка/Трек),
 * правая — SummaryCardLayout (заголовок «Состав заказа», список товаров, блок итогов).
 */
export function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col max-[1919px]:gap-12 min-[1920px]:flex-row min-[1920px]:justify-between">
      <div className="flex flex-col min-w-0">
        <div className="flex flex-col gap-6 min-[1024px]:gap-10.5">
          {/* Блок: заголовок + строка с номером и статусом */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-[22px] w-full max-w-xs min-[873px]:h-8 min-[1024px]:h-[38px]" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          {/* Блоки: Получатель, Контактные данные, Адрес, Способ доставки, Трек-номер */}
          <div className="flex flex-col gap-4 min-[873px]:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-2 min-[873px]:gap-3">
                <Skeleton className={cn(ORDER_LABEL_CLASS, "h-4 w-24")} />
                {i === 2 ? (
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full max-w-64" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-full max-w-64" />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Плейсхолдер кнопки «Оплатить» */}
        <Skeleton className="h-12 w-full max-[576px]:mt-6 min-[577px]:w-53.75 mt-8 min-[1024px]:mt-10 rounded-lg" />
      </div>
      {/* Правая колонка: карточка «Состав заказа» */}
      <div
        className={cn(
          SUMMARY_CARD_CONTAINER_CLASS,
          "w-full min-[1920px]:w-200 min-[1920px]:shrink-0 flex flex-col"
        )}
      >
        <Skeleton className={cn(SUMMARY_CARD_TITLE_CLASS, "block h-8 w-48")} />
        <div className="flex flex-col gap-4 pr-2 max-[576px]:max-h-80">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded" />
          ))}
        </div>
        <div className="mt-6 min-[873px]:mt-9 bg-[#F4F0F0] h-fit w-full min-[1920px]:w-175 flex flex-col rounded-[10px] p-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-6 w-28 mt-2" />
        </div>
      </div>
    </div>
  );
}
