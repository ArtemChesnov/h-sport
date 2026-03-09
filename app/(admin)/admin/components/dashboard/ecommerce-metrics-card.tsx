"use client";

/**
 * Компонент для отображения e-commerce метрик на дашборде
 * Единый стиль с основными показателями
 */

import { Card, CardContent, CardHeader, Skeleton } from "@/shared/components/ui";
import {
  MetricCard,
  MetricsSection,
  EmptyState,
  MetricsErrorBoundary,
} from "@/shared/components/admin";
import { useQuery } from "@tanstack/react-query";
import { Eye, Heart, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { DTO } from "@/shared/services";
import { periodToHours } from "@/shared/lib/period-converter";
import { pluralize } from "@/shared/lib/formatters";

interface EcommerceMetricsData {
  period: {
    from: string;
    to: string;
    windowMs: number;
  };
  views: {
    total: number;
    uniqueUsers: number;
    topProducts: Array<{ productId: number; views: number }>;
  };
  cart: {
    totalAdds: number;
    uniqueUsers: number;
    topProducts: Array<{ productId: number; adds: number }>;
  };
  favorites: {
    totalAdds: number;
    uniqueUsers?: number;
    topProducts: Array<{ productId: number; favorites: number }>;
  };
  engagement?: {
    rate: number;
    engagedUsers: number;
    totalViewers: number;
  };
  conversions: {
    viewToCart: {
      count: number;
      rate: number;
    };
    cartToOrder: {
      count: number;
      rate: number;
    };
    viewToOrder: {
      count: number;
    };
  };
}

async function fetchEcommerceMetrics(
  period: DTO.AdminDashboardPeriodDto
): Promise<EcommerceMetricsData> {
  const windowHours = periodToHours(period);
  const response = await fetch(`/api/metrics/ecommerce?window=${windowHours}`);
  if (!response.ok) {
    throw new Error("Failed to fetch ecommerce metrics");
  }
  return response.json();
}

import type { BaseMetricsCardProps } from "@/shared/services/dto";

type EcommerceMetricsCardProps = BaseMetricsCardProps;

export function EcommerceMetricsCard({ period }: EcommerceMetricsCardProps) {
  const {
    data: metrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ecommerce-metrics", period],
    queryFn: () => fetchEcommerceMetrics(period),
    staleTime: 5 * 60 * 1000, // Данные считаются свежими 5 минут
    refetchInterval: 5 * 60 * 1000, // Обновляем каждые 5 минут вместо 1 минуты
  });

  // Простые вычисления - useMemo не нужен для примитивов
  const uniqueUsersViews = metrics?.views?.uniqueUsers ?? 0;
  const uniqueUsersCart = metrics?.cart?.uniqueUsers ?? 0;
  const uniqueUsersFavorites = metrics?.favorites?.uniqueUsers ?? 0;
  const engagementRate = metrics?.engagement?.rate ?? 0;

  const viewToCartRate = metrics?.conversions?.viewToCart?.rate ?? 0;
  const cartToOrderRate = metrics?.conversions?.cartToOrder?.rate ?? 0;
  const viewToOrderCount = metrics?.conversions?.viewToOrder?.count ?? 0;

  // Только сложные вычисления мемоизируем
  const overallConversionRate = useMemo(() => {
    const viewsTotal = metrics?.views?.total;
    if (!viewsTotal || viewsTotal === 0) return 0;
    if (!viewToOrderCount) return 0;
    return (viewToOrderCount / viewsTotal) * 100;
  }, [metrics?.views?.total, viewToOrderCount]);

  const uniqueUsersViewsText = pluralize(
    uniqueUsersViews,
    "пользователь",
    "пользователя",
    "пользователей"
  );
  const uniqueUsersCartText = pluralize(
    uniqueUsersCart,
    "пользователь",
    "пользователя",
    "пользователей"
  );
  const uniqueUsersFavoritesText = pluralize(
    uniqueUsersFavorites,
    "пользователь",
    "пользователя",
    "пользователей"
  );

  const viewToCartCount = metrics?.conversions?.viewToCart?.count ?? 0;
  const viewToCartCountText = pluralize(viewToCartCount, "конверсия", "конверсии", "конверсий");

  const cartToOrderCount = metrics?.conversions?.cartToOrder?.count ?? 0;
  const cartToOrderCountText = pluralize(cartToOrderCount, "конверсия", "конверсии", "конверсий");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-48 mb-1" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-24" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <Skeleton className="h-9 w-20" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <EmptyState
        title="Ошибка загрузки e-commerce метрик"
        description="Не удалось загрузить данные. Попробуйте обновить страницу."
      />
    );
  }

  // Проверяем наличие данных
  if (!metrics.views || !metrics.cart || !metrics.favorites || !metrics.conversions) {
    return (
      <EmptyState
        title="Неполные данные метрик"
        description="Получены неполные данные. Попробуйте обновить страницу."
      />
    );
  }

  return (
    <MetricsErrorBoundary
      title="Ошибка отображения e-commerce метрик"
      description="Произошла ошибка при отображении данных. Попробуйте обновить страницу."
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Поведение пользователей</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Просмотры, корзина, избранное, вовлеченность и конверсии
          </p>
        </div>

        {/* Основные метрики поведения */}
        <MetricsSection>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={Eye}
              title="Просмотры товаров"
              value={(metrics.views?.total || 0).toLocaleString()}
              description={`${uniqueUsersViews} уникальных ${uniqueUsersViewsText}`}
              tooltipTitle="Просмотры товаров"
              tooltipContent="Общее количество просмотров страниц товаров за выбранный период. Показывает активность пользователей и интерес к товарам."
              color="slate"
            />

            <MetricCard
              icon={ShoppingCart}
              title="Добавления в корзину"
              value={(metrics.cart?.totalAdds || 0).toLocaleString()}
              description={`${uniqueUsersCart} уникальных ${uniqueUsersCartText}`}
              tooltipTitle="Добавления в корзину"
              tooltipContent="Количество добавлений товаров в корзину за период. Показывает намерение пользователей совершить покупку."
              color="teal"
            />

            <MetricCard
              icon={Heart}
              title="Добавления в избранное"
              value={(metrics.favorites?.totalAdds || 0).toLocaleString()}
              description={`${uniqueUsersFavorites} уникальных ${uniqueUsersFavoritesText}`}
              tooltipTitle="Добавления в избранное"
              tooltipContent="Количество добавлений товаров в избранное за период. Показывает интерес пользователей к товарам и потенциал будущих покупок."
              color="rose"
            />

            <MetricCard
              icon={Users}
              title="Коэффициент вовлеченности"
              value={engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "0.0%"}
              description={`${metrics.engagement?.engagedUsers || 0} из ${metrics.engagement?.totalViewers || 0} пользователей`}
              tooltipTitle="Коэффициент вовлеченности"
              tooltipContent="Процент пользователей, которые совершили действие (добавили в корзину или избранное) от общего числа просмотревших товары. Показывает общую активность и вовлеченность пользователей."
              color="indigo"
            />
          </div>
        </MetricsSection>

        {/* Конверсии */}
        <MetricsSection
          title="Конверсии"
          description="Эффективность превращения просмотров в заказы"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              icon={TrendingUp}
              title="Просмотр → Корзина"
              value={`${viewToCartRate.toFixed(1)}%`}
              description={`${viewToCartCount} ${viewToCartCountText}`}
              tooltipTitle="Конверсия Просмотр → Корзина"
              tooltipContent="Процент пользователей, которые добавили товар в корзину после просмотра. Показывает эффективность привлечения покупателей."
              color="cyan"
            />

            <MetricCard
              icon={ShoppingCart}
              title="Корзина → Заказ"
              value={`${cartToOrderRate.toFixed(1)}%`}
              description={`${cartToOrderCount} ${cartToOrderCountText}`}
              tooltipTitle="Конверсия Корзина → Заказ"
              tooltipContent="Процент пользователей, которые оформили заказ после добавления товара в корзину. Показывает эффективность процесса оформления заказа."
              color="emerald"
            />

            <MetricCard
              icon={Eye}
              title="Просмотр → Заказ"
              value={viewToOrderCount}
              description="прямых конверсий"
              tooltipTitle="Прямые конверсии"
              tooltipContent="Количество прямых конверсий от просмотра к заказу без промежуточного добавления в корзину. Показывает эффективность быстрых покупок."
              color="violet"
            />

            <MetricCard
              icon={TrendingUp}
              title="Общая конверсия"
              value={overallConversionRate > 0 ? `${overallConversionRate.toFixed(1)}%` : "0.0%"}
              description="Просмотр → Заказ (все пути)"
              tooltipTitle="Общая конверсия"
              tooltipContent="Общий процент конверсии от просмотра к заказу через все возможные пути (прямой и через корзину). Показывает общую эффективность превращения просмотров в продажи."
              color="amber"
            />
          </div>
        </MetricsSection>
      </div>
    </MetricsErrorBoundary>
  );
}
