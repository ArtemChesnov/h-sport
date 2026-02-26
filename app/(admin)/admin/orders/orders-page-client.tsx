"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Separator,
    Skeleton,
} from "@/shared/components/ui";
import { ShoppingBag } from "lucide-react";
import dynamic from "next/dynamic";
import { Breadcrumbs } from "../components/common/breadcrumbs";
import { PaginationControls } from "../components/common/pagination-controls";
import { ExportOrdersButton } from "../components/orders/export-orders-button";
import { OrdersFiltersCard } from "../components/orders/orders-filters-card";
import { useAdminOrdersQuery } from "./hooks/use-admin-orders-query";

const OrdersTable = dynamic(
  () => import("../components/orders/orders-table").then((mod) => ({ default: mod.OrdersTable })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
        <div className="space-y-0">
          <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-12 ml-auto" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b border-border/30 h-14 flex items-center gap-4 px-4">
              <Skeleton className="h-4 w-16 font-mono" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-9 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

export function OrdersPageClient() {
  const {
    statusValue,
    setStatusValue,
    emailValue,
    setEmailValue,
    data,
    isLoading,
    handleFiltersSubmit,
    handleResetFilters,
    handlePageChange,
  } = useAdminOrdersQuery();

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 pt-4 md:p-4 md:pt-6 lg:p-8">
      <Breadcrumbs />
      <header>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Заказы</h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Управление заказами магазина
          </p>
        </div>
      </header>

      <Separator />

      <div className="overflow-x-auto -mx-2 md:mx-0">
        <div className="min-w-[600px] px-2 md:px-0">
          <OrdersFiltersCard
            statusValue={statusValue}
            emailValue={emailValue}
            onStatusChange={setStatusValue}
            onEmailChange={setEmailValue}
            onSubmit={handleFiltersSubmit}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      {isLoading && (
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-indigo-50/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full overflow-x-auto rounded-lg border border-border/50 bg-background">
              <div className="space-y-0">
                <div className="bg-muted/30 border-b border-border/50 h-12 flex items-center gap-4 px-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border-b border-border/30 h-14 flex items-center gap-4 px-4">
                    <Skeleton className="h-4 w-16 font-mono" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-9 rounded ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-indigo-50/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-base font-semibold">Список заказов</CardTitle>
              </div>
              <ExportOrdersButton orders={data.items} disabled={isLoading} />
            </div>
            <CardDescription className="text-xs">
              Найдено {data.meta.total} {data.meta.total === 1 ? "заказ" : data.meta.total < 5 ? "заказа" : "заказов"} · страница {data.meta.page} из {data.meta.pages}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <OrdersTable orders={data.items} />
          </CardContent>

          {data.meta.pages > 1 && (
            <CardFooter className="border-t border-border/50 bg-muted/20 pt-4">
              <PaginationControls
                currentPage={data.meta.page}
                totalPages={data.meta.pages}
                onPageChange={handlePageChange}
              />
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
