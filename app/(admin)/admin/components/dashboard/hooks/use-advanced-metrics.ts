/**
 * Хук для загрузки и обработки расширенных метрик
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { periodToDays } from "@/shared/lib/period-converter";
import { METRICS_CONSTANTS } from "@/shared/constants";
import type { BaseMetricsCardProps } from "@/shared/services/dto";

interface AdvancedMetricsData {
  period: {
    days: number;
    from: string;
    to: string;
  };
  cart: {
    averageCartSize: number;
    abandonedCartRate: number;
    totalCarts: number;
    abandonedCarts: number;
    averageItemPrice: number;
  };
  orders: {
    totalOrders: number;
    averageOrderValue: number;
  };
  users: {
    newUsers: number;
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    repeatCustomers: number;
    averageOrdersPerUser: number;
    averageRevenuePerUser?: number;
    newVsReturningRate: number;
    newCustomersRate: number;
  };
  delivery: {
    distribution: Record<string, number>;
    averageDeliveryFee: number;
    totalDeliveries: number;
  };
  payment: {
    distribution: Record<string, number>;
    totalPayments: number;
  };
  categories: {
    popularCategories: Array<{
      name: string;
      views: number;
      orders: number;
      revenue: number;
      items: number;
      averageOrderValue: number;
    }>;
  };
}

async function fetchAdvancedMetrics(days: number = 30): Promise<AdvancedMetricsData> {
  const response = await fetch(`/api/metrics/advanced?days=${days}`);
  if (!response.ok) {
    throw new Error("Failed to fetch advanced metrics");
  }
  return response.json();
}

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  CDEK_PVZ: "СДЭК ПВЗ",
  CDEK_COURIER: "СДЭК Курьер",
  POCHTA_PVZ: "Почта ПВЗ",
  POCHTA_COURIER: "Почта Курьер",
  PICKUP_SHOWROOM: "Самовывоз",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  AUTO: "Автоматически",
  CARD: "Банковская карта",
  SBP: "СБП",
  BNPL: "Долями",
};

export function useAdvancedMetrics({ period }: BaseMetricsCardProps) {
  const actualDays = periodToDays(period);

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ["advanced-metrics", actualDays],
    queryFn: () => fetchAdvancedMetrics(actualDays),
    staleTime: METRICS_CONSTANTS.STALE_TIME,
    refetchInterval: METRICS_CONSTANTS.REFETCH_INTERVAL,
    placeholderData: (previousData) => previousData,
  });

  const topCategories = useMemo(
    () => metrics?.categories?.popularCategories ?? [],
    [metrics]
  );

  const deliveryDistribution = useMemo(() => {
    const delivery = metrics?.delivery;
    if (!delivery?.distribution) return [];
    const entries = Object.entries(delivery.distribution);
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const totalDeliveries = delivery.totalDeliveries;
    return sorted.map(([method, count]) => {
      const percentage = totalDeliveries > 0
        ? (count / totalDeliveries) * 100
        : 0;
      return { method, count, percentage };
    });
  }, [metrics]);

  const paymentDistribution = useMemo(() => {
    const payment = metrics?.payment;
    if (!payment?.distribution) return [];
    const entries = Object.entries(payment.distribution);
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const totalPayments = payment.totalPayments;
    return sorted.map(([method, count]) => {
      const percentage = totalPayments > 0
        ? (count / totalPayments) * 100
        : 0;
      return { method, count, percentage };
    });
  }, [metrics]);

  return {
    metrics,
    isLoading,
    error,
    topCategories,
    deliveryDistribution,
    paymentDistribution,
    deliveryMethodLabels: DELIVERY_METHOD_LABELS,
    paymentMethodLabels: PAYMENT_METHOD_LABELS,
  };
}
