/**
 * Компонент секции топ товаров
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import { MetricsSection, EmptyState } from "@/shared/components/admin";
import { formatMoney } from "@/shared/lib/formatters";
import { METRICS_CONSTANTS } from "@/shared/constants";
import { Trophy, Info } from "lucide-react";
import Link from "next/link";

type TopProductsSectionProps = {
  topProducts: Array<{
    productId: number;
    name: string;
    slug?: string | null;
    totalQty: number;
    totalRevenue: number;
  }>;
  isLoading?: boolean;
};

export function TopProductsSection({ topProducts, isLoading }: TopProductsSectionProps) {
  return (
    <MetricsSection title="Товары" description="По количеству продаж">
      {isLoading ? (
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
            <Skeleton className="h-3 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: METRICS_CONSTANTS.TOP_ITEMS_COUNT }, (_, i) => (
                <div
                  key={`top-product-skeleton-${i}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="rounded-2xl border shadow-sm cursor-help">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="h-5 w-5 text-amber-600" />
                  <CardTitle className="text-base font-semibold">Топ товары</CardTitle>
                  <Info className="h-3.5 w-3.5 text-amber-600 opacity-60" />
                </div>
                <CardDescription className="text-xs">По количеству продаж</CardDescription>
              </CardHeader>
              <CardContent>
                {!topProducts || topProducts.length === 0 ? (
                  <EmptyState
                    title="Нет данных"
                    description="За выбранный период нет данных о продажах"
                  />
                ) : (
                  <div className="space-y-2">
                    {topProducts.slice(0, METRICS_CONSTANTS.TOP_ITEMS_COUNT).map((item, index) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold shadow-sm shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            {item.slug ? (
                              <Link
                                href={`/admin/products/${item.slug}`}
                                className="text-sm font-medium hover:text-primary hover:underline transition-colors block truncate"
                              >
                                {item.name}
                              </Link>
                            ) : (
                              <span className="text-sm font-medium block truncate">
                                {item.name}
                              </span>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {item.totalQty}{" "}
                              {item.totalQty === 1 ? "шт" : item.totalQty < 5 ? "шт" : "шт"} ·{" "}
                              {formatMoney(item.totalRevenue)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-semibold">{formatMoney(item.totalRevenue)}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.totalQty}{" "}
                            {item.totalQty === 1 ? "шт" : item.totalQty < 5 ? "шт" : "шт"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p className="text-xs leading-relaxed">
              Топ-5 товаров по количеству продаж за выбранный период. Показывает самые популярные
              товары с указанием количества проданных единиц и общей выручки. Помогает понять, какие
              товары наиболее востребованы.
            </p>
          </TooltipContent>
        </Tooltip>
      )}
    </MetricsSection>
  );
}
