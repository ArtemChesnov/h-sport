"use client";

import { AuthRequiredDialog, ErrorFallbackBlock, StoreEmptyBlock } from "@/shared/components/common";
import { CTA } from "@/shared/constants";
import { useAuthCheck, useOrdersListQuery } from "@/shared/hooks";
import { useAuthRequiredDialog } from "@/shared/hooks/account/use-auth-required-dialog";
import { Package } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { OrderCard } from "./_components/order-card";
import { OrdersPageSkeleton } from "./_components/orders-page-skeleton";
import { OrdersPagination } from "./_components/orders-pagination";

const ORDERS_PER_PAGE = 5;

export function OrdersPageClient() {
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const { isAuthenticated, isLoading: isAuthLoading } = useAuthCheck();
  const { data, isLoading, isError, refetch } = useOrdersListQuery({
    page,
    perPage: ORDERS_PER_PAGE,
  });
  const orders = data?.items ?? [];
  const meta = data?.meta;
  const { authDialogProps } = useAuthRequiredDialog({
    description: "Чтобы просматривать заказы, необходимо войти в аккаунт или зарегистрироваться.",
  });

  return (
    <>
      {isAuthLoading || !isAuthenticated || isLoading ? (
        <OrdersPageSkeleton />
      ) : (
        <div
          className="space-y-6 min-h-100 max-[576px]:space-y-6 min-[873px]:space-y-8 min-[1024px]:space-y-10"
          data-orders-section
        >
          {/* Заголовок - всегда виден */}
          <div className="flex items-center gap-2 min-h-7">
            <h1 className="text-[22px] leading-[100%] font-semibold max-[576px]:text-[22px] min-[873px]:text-[32px] min-[1024px]:text-[38px]">
              Мои заказы
            </h1>
          </div>

          {isError && (
            <ErrorFallbackBlock
              title="Не удалось загрузить список заказов"
              description="Попробуйте обновить страницу."
              onRetry={() => refetch()}
              secondaryAction={{ href: "/account", label: "В личный кабинет" }}
              minHeight="40vh"
            />
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <StoreEmptyBlock
              title="У вас пока нет заказов"
              description="Когда вы оформите первый заказ, он появится здесь"
              icon={Package}
              action={{ href: "/catalog", label: CTA.GO_TO_CATALOG }}
            />
          )}

          {/* Список заказов */}
          {!isLoading && !isError && orders.length > 0 && (
            <>
              <div className="space-y-4 max-[576px]:space-y-4 min-[873px]:space-y-5">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>

              {meta && <OrdersPagination meta={meta} />}
            </>
          )}
        </div>
      )}

      <AuthRequiredDialog {...authDialogProps} />
    </>
  );
}
