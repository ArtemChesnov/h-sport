/**
 * Фасад для компонента расширенных метрик
 *
 * Рефакторинг: код разбит на модули:
 * - hooks/use-advanced-metrics.ts - хук для загрузки данных
 * - common/advanced-metrics-skeleton.tsx - скелетон загрузки
 * - common/categories-section.tsx - секция категорий
 * - common/top-products-section.tsx - секция товаров
 * - common/delivery-payment-section.tsx - секция доставки и оплаты
 *
 * Этот компонент собирает все секции расширенных метрик
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
import { useTopProducts } from "@/shared/hooks/admin/use-top-products";
import { TrendingUp, Users } from "lucide-react";
import React from "react";
import type { BaseMetricsCardProps } from "@/shared/services/dto";
import { useAdvancedMetrics } from "./hooks/use-advanced-metrics";
import { AdvancedMetricsSkeleton } from "./common/advanced-metrics-skeleton";
import { CategoriesSection } from "./common/categories-section";
import { TopProductsSection } from "./common/top-products-section";
import { DeliveryPaymentSection } from "./common/delivery-payment-section";

type AdvancedMetricsCardProps = BaseMetricsCardProps;

export function AdvancedMetricsCard({ period }: AdvancedMetricsCardProps) {
  const {
    metrics,
    isLoading,
    error,
    topCategories,
    deliveryDistribution,
    paymentDistribution,
    deliveryMethodLabels,
    paymentMethodLabels,
  } = useAdvancedMetrics({ period });

  const { topProducts = [], isLoading: isTopProductsLoading = false } = useTopProducts(period);

  if (isLoading) {
    return <AdvancedMetricsSkeleton />;
  }

  if (error || !metrics) {
    return (
      <EmptyState
        title="Ошибка загрузки метрик"
        description="Не удалось загрузить данные. Попробуйте обновить страницу."
      />
    );
  }

  return (
    <MetricsErrorBoundary
      title="Ошибка отображения аналитики продаж"
      description="Произошла ошибка при отображении данных. Попробуйте обновить страницу."
    >
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Аналитика продаж</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Категории, товары, пользователи, доставка и оплата
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            <CategoriesSection categories={topCategories} />
            <TopProductsSection topProducts={topProducts} isLoading={isTopProductsLoading} />
          </div>

          {/* Пользователи */}
          <MetricsSection title="Пользователи" description="Аналитика по клиентам и их активности">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Users}
                title="Всего клиентов"
                value={metrics.users.totalCustomers}
                description={`${metrics.users.newCustomers} новых, ${metrics.users.returningCustomers} вернувшихся`}
                tooltipTitle="Всего клиентов"
                tooltipContent="Общее количество уникальных клиентов, сделавших заказы за выбранный период. Включает новых и возвращающихся клиентов."
                color="slate"
              />

              <MetricCard
                icon={TrendingUp}
                title="Повторные покупки"
                value={metrics.users.repeatCustomers}
                description={`${metrics.users.averageOrdersPerUser.toFixed(1)} заказов на клиента`}
                tooltipTitle="Повторные покупки"
                tooltipContent="Количество клиентов, сделавших более одного заказа за период. Показывает лояльность клиентской базы и повторные покупки."
                color="cyan"
              />

              <MetricCard
                icon={Users}
                title="Новые клиенты"
                value={`${metrics.users.newCustomersRate.toFixed(1)}%`}
                description="от всех клиентов за период"
                tooltipTitle="Новые клиенты"
                tooltipContent="Процент новых клиентов, сделавших первый заказ в течение 24 часов после регистрации. Показывает эффективность привлечения новых покупателей."
                color="green"
              />

              <MetricCard
                icon={TrendingUp}
                title="Средняя выручка на клиента"
                value={formatMoney(metrics.users.averageRevenuePerUser || 0)}
                description="ARPU (Average Revenue Per User)"
                tooltipTitle="ARPU (Average Revenue Per User)"
                tooltipContent="Средняя выручка на одного клиента за период. Рассчитывается как общая выручка, разделенная на количество клиентов. Показывает среднюю ценность клиента для бизнеса."
                color="purple"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Детальная аналитика по клиентам (LTV, VIP клиенты) доступна в блоке
              &quot;Бизнес-аналитика&quot; ниже
            </p>
          </MetricsSection>

          <DeliveryPaymentSection
            delivery={{
              distribution: deliveryDistribution,
              averageDeliveryFee: metrics.delivery.averageDeliveryFee,
            }}
            payment={{
              distribution: paymentDistribution,
            }}
            deliveryMethodLabels={deliveryMethodLabels}
            paymentMethodLabels={paymentMethodLabels}
          />
        </div>
      </TooltipProvider>
    </MetricsErrorBoundary>
  );
}
