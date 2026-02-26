"use client";

/**
 * Компонент для отображения пустых состояний
 * Единый стиль для всех метрик
 */

import { Inbox } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  /** Заголовок */
  title?: string;
  /** Описание */
  description?: string;
  /** Иконка */
  icon?: LucideIcon;
  /** Дополнительные CSS классы */
  className?: string;
}

export function EmptyState({
  title = "Нет данных",
  description = "За выбранный период нет данных",
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className ?? ""}`}>
      <Icon className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground text-center max-w-sm">{description}</p>
    </div>
  );
}
