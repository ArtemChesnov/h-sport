"use client";

/**
 * Переиспользуемый компонент для карточек с графиками
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/components/ui";
import { type LucideIcon } from "lucide-react";
import React from "react";
import { EmptyState } from "./empty-state";

export interface ChartCardProps {
  /** Иконка графика */
  icon: LucideIcon;
  /** Заголовок */
  title: string;
  /** Описание */
  description?: string;
  /** Дети (обычно ResponsiveContainer с графиком) */
  children: React.ReactNode;
  /** Высота графика */
  height?: number | string;
  /** Загрузка */
  isLoading?: boolean;
  /** Нет данных */
  isEmpty?: boolean;
  /** Текст при отсутствии данных */
  emptyText?: string;
  /** Общее значение (показывается справа в заголовке) */
  totalValue?: React.ReactNode;
  /** Дополнительные CSS классы */
  className?: string;
}

export function ChartCard({
  icon: Icon,
  title,
  description,
  children,
  height = 320,
  isLoading = false,
  isEmpty = false,
  emptyText = "Нет данных за выбранный период",
  totalValue,
  className,
}: ChartCardProps) {
  if (isLoading) {
    return (
      <Card className={`rounded-2xl border shadow-sm ${className ?? ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
              {description && <Skeleton className="h-3 w-36 mt-1" />}
            </div>
            {totalValue && (
              <div className="text-right">
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton
            className="w-full rounded-lg"
            style={{ height: typeof height === "number" ? `${height}px` : height }}
          />
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className={`rounded-2xl border shadow-sm ${className ?? ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center rounded-lg bg-muted/50">
            <EmptyState description={emptyText} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`rounded-2xl border shadow-sm ${className ?? ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </div>
            {description && <CardDescription className="text-xs">{description}</CardDescription>}
          </div>
          {totalValue && (
            <div className="text-right">
              {typeof totalValue === "string" || typeof totalValue === "number" ? (
                <>
                  <p className="text-lg font-bold">{totalValue}</p>
                  <p className="text-xs text-muted-foreground">Всего</p>
                </>
              ) : (
                totalValue
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-6">
        <div style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
