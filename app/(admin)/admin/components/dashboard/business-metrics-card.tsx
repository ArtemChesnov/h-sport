/**
 * Фасад для компонента бизнес-метрик
 *
 * Рефакторинг: код разбит на модули:
 * - hooks/use-business-metrics.ts - хук для загрузки данных
 * - common/business-metrics-skeleton.tsx - скелетон загрузки
 * - common/promo-codes-section.tsx - секция промокодов
 * - common/product-variants-section.tsx - секция размеров/цветов
 * - common/abandoned-carts-top-products.tsx - топ товаров в корзинах
 *
 * Этот компонент собирает все секции бизнес-метрик
 */

"use client";

import { TooltipProvider } from "@/shared/components/ui";
import {
  MetricCard,
  MetricsSection,
  EmptyState,
  MetricsErrorBoundary,
} from "@/shared/components/admin";
import { formatMoney } from "@/shared/lib/formatters";
import {
  ShoppingCart,
  Users,
  TicketPercent,
  TrendingDown,
  TrendingUp,
  Clock,
  Package,
} from "lucide-react";
import React from "react";
import type { BaseMetricsCardProps } from "@/shared/services/dto";
import { useBusinessMetrics } from "./hooks/use-business-metrics";
import { BusinessMetricsSkeleton } from "./common/business-metrics-skeleton";
import { PromoCodesSection } from "./common/promo-codes-section";
import { ProductVariantsSection } from "./common/product-variants-section";
import { AbandonedCartsTopProducts } from "./common/abandoned-carts-top-products";

type BusinessMetricsCardProps = BaseMetricsCardProps;

export function BusinessMetricsCard({ period }: BusinessMetricsCardProps) {
  const { data, isLoading, error, topHourFormatted, withPromoCodePercent, vipCustomersCount } =
    useBusinessMetrics({ period });

  if (isLoading) {
    return <BusinessMetricsSkeleton />;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Ошибка загрузки бизнес-метрик"
        description="Не удалось загрузить данные. Попробуйте обновить страницу."
      />
    );
  }

  return (
    <MetricsErrorBoundary
      title="Ошибка отображения бизнес-метрик"
      description="Произошла ошибка при отображении данных. Попробуйте обновить страницу."
    >
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Бизнес-метрики</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Уникальная аналитика для оперативного управления
            </p>
          </div>

          {/* Брошенные корзины */}
          <MetricsSection title="Брошенные корзины">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={ShoppingCart}
                title="Брошенных корзин"
                value={data.abandonedCarts.total}
                description="Не превратились в заказы"
                tooltipTitle="Брошенные корзины"
                tooltipContent="Общее количество корзин с товарами, которые не были превращены в заказы. Показывает упущенные возможности продаж и эффективность процесса оформления заказа."
                color="rose"
              />

              <MetricCard
                icon={TrendingDown}
                title="Упущенная выручка"
                value={formatMoney(data.abandonedCarts.totalValue)}
                description={`Средний чек: ${formatMoney(data.abandonedCarts.averageValue)}`}
                tooltipTitle="Упущенная выручка"
                tooltipContent="Общая сумма всех брошенных корзин. Показывает потенциальную выручку, которую можно было бы получить, если бы все корзины были оформлены в заказы."
                color="orange"
              />

              <MetricCard
                icon={TicketPercent}
                title="С промокодом"
                value={data.abandonedCarts.withPromoCode}
                description={`${withPromoCodePercent}% от всех`}
                tooltipTitle="Брошенные корзины с промокодом"
                tooltipContent="Количество брошенных корзин, в которых использовался промокод. Показывает эффективность промокодов в процессе оформления заказа и может указывать на проблемы с применением скидок."
                color="purple"
              />

              <MetricCard
                icon={Clock}
                title="Топ час"
                value={topHourFormatted}
                description="Больше всего брошенных корзин"
                tooltipTitle="Час с максимальным количеством брошенных корзин"
                tooltipContent="Час суток, в который было заброшено больше всего корзин. Помогает определить оптимальное время для отправки напоминаний или промо-акций."
                color="blue"
              />
            </div>
          </MetricsSection>

          {/* LTV и повторные покупки */}
          <MetricsSection title="Клиенты и LTV" description="Детальная аналитика ценности клиентов">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Users}
                title="Всего клиентов"
                value={data.ltv.totalCustomers}
                description="За период"
                tooltipTitle="Всего клиентов"
                tooltipContent="Общее количество уникальных клиентов, сделавших заказы за выбранный период. Это базовая метрика для расчета других показателей ценности клиентов."
                color="slate"
              />

              <MetricCard
                icon={TrendingUp}
                title="Повторные покупки"
                value={`${data.ltv.repeatCustomersRate.toFixed(1)}%`}
                description={`${data.ltv.repeatCustomersCount} клиентов`}
                tooltipTitle="Повторные покупки"
                tooltipContent="Процент клиентов, которые сделали более одного заказа за период. Показывает лояльность клиентской базы и эффективность удержания клиентов."
                color="emerald"
              />

              <MetricCard
                icon={Package}
                title="Средний LTV"
                value={formatMoney(data.ltv.averageLTV)}
                description={`${data.ltv.averageOrdersPerCustomer.toFixed(1)} заказов на клиента`}
                tooltipTitle="Средний LTV (Lifetime Value)"
                tooltipContent="Средний Lifetime Value (LTV) клиента — общая сумма всех заказов клиента за весь период его взаимодействия с магазином. Показывает долгосрочную ценность клиента для бизнеса."
                color="cyan"
              />

              <MetricCard
                icon={Users}
                title="VIP клиенты"
                value={vipCustomersCount}
                description="3+ заказов"
                tooltipTitle="VIP клиенты"
                tooltipContent="Количество клиентов, сделавших 3 и более заказов. Это самые лояльные и ценные клиенты, которые генерируют значительную часть выручки и требуют особого внимания."
                color="indigo"
              />
            </div>
          </MetricsSection>

          <PromoCodesSection promoCodes={data.promoCodes} />

          <ProductVariantsSection
            sizes={data.productVariants.sizes}
            colors={data.productVariants.colors}
            topCombinations={data.productVariants.topCombinations}
          />

          <AbandonedCartsTopProducts products={data.abandonedCarts.topProducts} />
        </div>
      </TooltipProvider>
    </MetricsErrorBoundary>
  );
}
