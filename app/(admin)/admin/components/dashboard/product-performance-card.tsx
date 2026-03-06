"use client";

import { TooltipProvider } from "@/shared/components/ui";
import { EmptyState, MetricsErrorBoundary } from "@/shared/components/admin";
import { formatMoney } from "@/shared/lib/formatters";
import { useProductPerformance } from "./hooks/use-product-performance";
import type { BaseMetricsCardProps } from "@/shared/services/dto";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import Link from "next/link";

type ProductPerformanceCardProps = BaseMetricsCardProps;

export function ProductPerformanceCard({ period }: ProductPerformanceCardProps) {
  const { data, isLoading, error } = useProductPerformance({ period }, 20);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-5 w-52 mb-1" />
          <Skeleton className="h-3 w-68" />
        </div>
        <Skeleton className="h-[200px] rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Ошибка загрузки производительности товаров"
        description="Не удалось загрузить данные. Попробуйте обновить страницу."
      />
    );
  }

  const products = data.products ?? [];

  return (
    <MetricsErrorBoundary
      title="Ошибка отображения производительности товаров"
      description="Произошла ошибка при отображении данных. Попробуйте обновить страницу."
    >
      <TooltipProvider>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Производительность товаров</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              По каждому товару: просмотры, корзина, заказы, выручка и конверсии
            </p>
          </div>

          {products.length > 0 && (
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Топ товаров по активности</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px]">Товар</TableHead>
                        <TableHead className="text-right w-[80px]">Просмотры</TableHead>
                        <TableHead className="text-right w-[80px]">В корзину</TableHead>
                        <TableHead className="text-right w-[70px]">Заказы</TableHead>
                        <TableHead className="text-right w-[100px]">Выручка</TableHead>
                        <TableHead className="text-right w-[90px]">View→Cart</TableHead>
                        <TableHead className="text-right w-[90px]">Cart→Order</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.productId}>
                          <TableCell className="text-xs">
                            <Link
                              href={`/admin/products/${p.slug}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {p.name}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {p.views.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {p.cartAdds.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {p.orders.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {formatMoney(p.revenue)}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {Number(p.viewToCartRate).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {Number(p.cartToOrderRate).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TooltipProvider>
    </MetricsErrorBoundary>
  );
}
