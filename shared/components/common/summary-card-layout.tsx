"use client";

import {
  SUMMARY_CARD_CONTAINER_CLASS,
  SUMMARY_CARD_TITLE_CLASS,
} from "@/shared/constants";
import { cn } from "@/shared/lib";
import React from "react";

export type SummaryCardLayoutProps = {
  title: string;
  /** Список товаров (CheckoutSummaryItem / OrderDetailItem) */
  itemsList?: React.ReactNode;
  /** OrderSummaryBlock или его содержимое */
  summary: React.ReactNode;
  containerClassName?: string;
  /** Класс для скролла списка товаров */
  itemsListClassName?: string;
};

/**
 * Общий layout summary-карточки.
 * Используется в CartSummaryCard, CheckoutSummaryCard, блоке заказа в ЛК.
 */
export function SummaryCardLayout({
  title,
  itemsList,
  summary,
  containerClassName,
  itemsListClassName,
}: SummaryCardLayoutProps) {
  return (
    <div
      className={cn(
        SUMMARY_CARD_CONTAINER_CLASS,
        "flex flex-col h-fit transition-shadow duration-200",
        containerClassName
      )}
    >
      <h3 className={SUMMARY_CARD_TITLE_CLASS}>{title}</h3>
      {itemsList && (
        <div className={cn("w-full flex flex-col", itemsListClassName)}>{itemsList}</div>
      )}
      {summary}
    </div>
  );
}
