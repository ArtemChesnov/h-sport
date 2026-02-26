"use client";

/**
 * Обертка для секции метрик
 * Обеспечивает единый стиль группировки
 */

import React from "react";

export interface MetricsSectionProps {
  /** Заголовок секции */
  title?: string;
  /** Описание секции */
  description?: string;
  /** Дети компонента */
  children: React.ReactNode;
  /** Дополнительные CSS классы */
  className?: string;
}

export function MetricsSection({ title, description, children, className }: MetricsSectionProps) {
  return (
    <div className={className}>
      {title && (
        <div className="mb-4">
          {title && <h4 className="text-sm font-medium text-muted-foreground mb-1">{title}</h4>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
