/**
 * Карточка с топ-товарами за период
 * Премиум дизайн в едином стиле
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/components/ui";
import { DTO } from "@/shared/services";
import { formatMoney } from "@/shared/lib";
import Link from "next/link";
import { Trophy } from "lucide-react";

interface TopProductsCardProps {
  topProducts: DTO.AdminDashboardTopProductDto[] | undefined;
  isLoading: boolean;
}

export function TopProductsCard({ topProducts, isLoading }: TopProductsCardProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const products = topProducts ?? [];

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-base font-semibold">Топ товары</CardTitle>
        </div>
        <CardDescription className="text-xs">По количеству продаж</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground text-center px-4">
              За выбранный период нет данных о продажах
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 5).map((item, index) => (
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
                      <span className="text-sm font-medium block truncate">{item.name}</span>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {item.totalQty} {item.totalQty === 1 ? "шт" : item.totalQty < 5 ? "шт" : "шт"} · {formatMoney(item.totalRevenue)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold">{formatMoney(item.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">{item.totalQty} {item.totalQty === 1 ? "шт" : item.totalQty < 5 ? "шт" : "шт"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
