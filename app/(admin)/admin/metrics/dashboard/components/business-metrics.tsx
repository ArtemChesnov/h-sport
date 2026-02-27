"use client";

import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAdvancedMetricsQuery } from "@/shared/hooks/admin/use-advanced-metrics-query";
import { formatMoney } from "@/shared/lib/formatters";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

interface AdvancedMetrics {
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
    averageRevenuePerUser: number;
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

function OrdersToday() {
  const { data: metrics, isLoading } = useAdvancedMetricsQuery(1); // 1 day

  if (isLoading || !metrics) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const typedMetrics = metrics as AdvancedMetrics;

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold">{typedMetrics.orders.totalOrders}</div>
      <p className="text-xs text-muted-foreground">
        Ср. чек: {formatMoney(typedMetrics.orders.averageOrderValue)}
      </p>
    </div>
  );
}

function FullView() {
  const { data: metrics, isLoading } = useAdvancedMetricsQuery(30); // 30 days

  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Business Metrics</CardTitle>
            <CardDescription>Загрузка бизнес метрик...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedMetrics = metrics as AdvancedMetrics;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заказы</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typedMetrics.orders.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Ср. чек: {formatMoney(typedMetrics.orders.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Клиенты</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typedMetrics.users.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Новых: {typedMetrics.users.newCustomers} ({typedMetrics.users.newCustomersRate}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выручка</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMoney(
                typedMetrics.users.totalCustomers * typedMetrics.users.averageRevenuePerUser
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              ARPU: {formatMoney(typedMetrics.users.averageRevenuePerUser)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Брошенные корзины</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typedMetrics.cart.abandonedCartRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {typedMetrics.cart.abandonedCarts} из {typedMetrics.cart.totalCarts}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Способы доставки</CardTitle>
            <CardDescription>Распределение заказов по методам доставки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(typedMetrics.delivery.distribution).map(([method, count]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{method}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ср. стоимость доставки</span>
                  <span className="font-medium">
                    {formatMoney(typedMetrics.delivery.averageDeliveryFee)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Способы оплаты</CardTitle>
            <CardDescription>Распределение платежей по методам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(typedMetrics.payment.distribution).map(([method, count]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{method}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Популярные категории</CardTitle>
          <CardDescription>Топ-5 категорий по выручке</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typedMetrics.categories.popularCategories.slice(0, 5).map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <div>
                    <div className="font-medium text-sm">{category.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.orders} заказов, {category.items} шт.
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatMoney(category.revenue)}</div>
                  <div className="text-xs text-muted-foreground">
                    Ср. чек: {formatMoney(category.averageOrderValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const BusinessMetrics = {
  OrdersToday,
  FullView,
};
