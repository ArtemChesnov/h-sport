"use client";

import {
  SHOP_ERROR_EMPTY_DESCRIPTION_CLASS,
  SHOP_ERROR_EMPTY_TITLE_CLASS,
  SHOP_ERROR_ICON_WRAPPER_CLASS,
} from "@/shared/constants";
import { DesignButton } from "@/shared/components/ui/design-button";
import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export type StoreEmptyBlockProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    href: string;
    label: string;
  };
  className?: string;
};

/**
 * Блок пустого состояния.
 * Используется на страницах: корзина, избранное, заказы, каталог (нет товаров).
 */
export function StoreEmptyBlock({
  title,
  description,
  icon: Icon = ShoppingBag,
  action,
  className,
}: StoreEmptyBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[40vh] text-center py-12 px-6 animate-fade-in-up bg-background",
        className
      )}
    >
      <div className={cn(SHOP_ERROR_ICON_WRAPPER_CLASS, "mb-4")}>
        <Icon className="h-8 w-8 text-primary" aria-hidden />
      </div>
      <h2 className={cn(SHOP_ERROR_EMPTY_TITLE_CLASS, "mb-3")}>{title}</h2>
      {description && (
        <p className={cn(SHOP_ERROR_EMPTY_DESCRIPTION_CLASS, "mb-8 max-w-xl")}>{description}</p>
      )}
      {action && (
        <Link href={action.href}>
          <DesignButton variant="primary">{action.label}</DesignButton>
        </Link>
      )}
    </div>
  );
}
