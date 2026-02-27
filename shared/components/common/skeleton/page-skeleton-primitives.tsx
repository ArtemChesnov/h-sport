/**
 * Примитивы для скелетонов страниц: хлебные крошки, заголовок, карточка.
 * Переиспользуются в cart, checkout, account и др. без дублирования разметки.
 */

import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import React from "react";

export type PageSkeletonBreadcrumbProps = {
  className?: string;
};

/** Одна строка под хлебные крошки */
export function PageSkeletonBreadcrumb({ className }: PageSkeletonBreadcrumbProps) {
  return <Skeleton className={cn("h-10 w-40 rounded-md", className)} aria-hidden />;
}

export type PageSkeletonTitleProps = {
  className?: string;
};

/** Заголовок страницы (адаптивная высота/ширина на мобиле) */
export function PageSkeletonTitle({ className }: PageSkeletonTitleProps) {
  return (
    <Skeleton
      className={cn("h-10 w-48 mt-10 rounded-md max-[768px]:h-7 max-[768px]:w-36", className)}
      aria-hidden
    />
  );
}

export type PageSkeletonCardProps = {
  className?: string;
  children?: React.ReactNode;
};

/** Блок-карточка (например саммари): фон + отступы, внутри — контент скелетона */
export function PageSkeletonCard({ className, children }: PageSkeletonCardProps) {
  return (
    <div
      className={cn(
        "p-10 bg-[#F4F0F0] h-fit w-full flex flex-col justify-between rounded-[10px]",
        className
      )}
    >
      {children}
    </div>
  );
}
