/**
 * Скелетоны для компонентов checkout
 */

import { Skeleton } from "@/shared/components/ui/skeleton";
import { SUMMARY_CARD_CONTAINER_CLASS } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
export function CheckoutInputSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-3 w-20 rounded-md" />
      <Skeleton className="h-9 w-full rounded-[10px]" />
    </div>
  );
}

export function CheckoutAddressFieldsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <CheckoutInputSkeleton />
        <CheckoutInputSkeleton />
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr,1fr]">
        <CheckoutInputSkeleton />
        <CheckoutInputSkeleton />
      </div>
    </div>
  );
}

export function CheckoutContactFieldsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <CheckoutInputSkeleton />
        <CheckoutInputSkeleton />
      </div>
      <CheckoutInputSkeleton />
    </div>
  );
}

export function CheckoutCartItemsSkeleton() {
  return (
    <div className="space-y-3 border-b border-neutral-200 pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-[60px] w-[45px] flex-shrink-0 rounded-[10px]" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CheckoutDeliveryMethodSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-[10px]" />
      ))}
    </div>
  );
}

/**
 * Скелетон правой колонки «Ваш заказ» (саммари карточка).
 * Повторяет SummaryCardLayout: заголовок, список товаров, блок итогов.
 */
export function CheckoutSummaryCardSkeleton() {
  return (
    <div className={cn(SUMMARY_CARD_CONTAINER_CLASS, "flex flex-col h-fit w-200 shrink-0")}>
      <Skeleton className="h-8 w-40 rounded-[10px]" />
      <div className="mt-10 flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-16 w-16 flex-shrink-0 rounded-[10px]" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-full max-w-[120px] rounded-[10px]" />
              <Skeleton className="h-4 w-20 rounded-[10px]" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-9 h-0.75 w-full bg-primary/20 rounded" />
      <div className="mt-9 w-175 flex flex-col gap-6 rounded-[10px] bg-[#F4F0F0]/50 p-6">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24 rounded-[10px]" />
          <Skeleton className="h-5 w-16 rounded-[10px]" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-5 w-28 rounded-[10px]" />
          <Skeleton className="h-5 w-20 rounded-[10px]" />
        </div>
        <Skeleton className="h-11 w-full rounded-[10px]" />
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20 rounded-[10px]" />
          <Skeleton className="h-5 w-14 rounded-[10px]" />
        </div>
        <div className="w-full h-0.75 bg-primary/20 rounded" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20 rounded-[10px]" />
          <Skeleton className="h-6 w-24 rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <section className="space-y-6 text-xs">
      <div className="space-y-4">
        <Skeleton className="h-5 w-64 rounded-md" />
        <CheckoutCartItemsSkeleton />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <CheckoutContactFieldsSkeleton />
        <CheckoutDeliveryMethodSkeleton />
        <CheckoutAddressFieldsSkeleton />
        <div className="pt-4">
          <Skeleton className="h-10 w-full max-w-xs rounded-[10px]" />
        </div>
      </div>
    </section>
  );
}

export function CheckoutPaymentPageSkeleton() {
  return (
    <section className="space-y-6 text-xs">
      <Skeleton className="h-5 w-48" />

      {/* Состав заказа */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <CheckoutCartItemsSkeleton />
      </div>

      {/* Контактные данные */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>

      {/* Доставка */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-3">
          <div className="space-y-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>

      {/* Итоговая сумма */}
      <div className="space-y-2 border-t border-neutral-200 pt-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Способ оплаты */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Skeleton className="h-10 w-full sm:w-auto sm:flex-1" />
        <Skeleton className="h-10 w-full sm:w-auto sm:flex-1" />
      </div>
    </section>
  );
}

export function CheckoutSuccessPageSkeleton() {
  return (
    <section className="space-y-6 text-sm">
      <div className="text-center space-y-4">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-7 w-64" />
        <Skeleton className="mx-auto h-5 w-96 max-w-md" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Skeleton className="h-14 w-full flex-1 rounded-[10px]" />
        <Skeleton className="h-14 w-full flex-1 rounded-[10px]" />
      </div>

      <div className="text-center">
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
    </section>
  );
}
