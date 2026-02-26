"use client";

/**
 * Переиспользуемый компонент карточки метрики
 * Поддерживает все варианты отображения метрик в админ-панели
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui";
import { Info } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import React from "react";
import { METRIC_CARD_STYLES, type MetricCardColor } from "@/shared/lib/styles";

export interface MetricCardProps {
  /** Иконка метрики */
  icon: LucideIcon;
  /** Заголовок метрики */
  title: string;
  /** Значение метрики (строка или число) */
  value: string | number;
  /** Описание под значением */
  description?: string;
  /** Заголовок тултипа */
  tooltipTitle: string;
  /** Содержимое тултипа */
  tooltipContent: string;
  /** Цветовая схема карточки */
  color: MetricCardColor;
  /** Индикатор сравнения (стрелка вверх/вниз) */
  comparisonIndicator?: React.ReactNode;
  /** Дополнительные CSS классы */
  className?: string;
}

export function MetricCard({
  icon: Icon,
  title,
  value,
  description,
  tooltipTitle,
  tooltipContent,
  color,
  comparisonIndicator,
  className,
}: MetricCardProps) {
  // Fallback для недопустимых цветов - используем slate по умолчанию
  const styles = METRIC_CARD_STYLES[color] ?? METRIC_CARD_STYLES.slate;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={`rounded-2xl border shadow-sm ${styles.gradient} ${styles.border} ${styles.shadow} cursor-help ${className ?? ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between space-y-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className={`h-5 w-5 ${styles.iconColor}`} />
                  <CardDescription className={`text-xs font-medium ${styles.textColor}`}>
                    {title}
                  </CardDescription>
                  <Info className={`h-3.5 w-3.5 ${styles.iconColor} opacity-60`} />
                </div>
                {comparisonIndicator && <div className="ml-auto">{comparisonIndicator}</div>}
              </div>
              <CardTitle className={`text-3xl font-bold ${styles.titleColor}`}>
                {value}
              </CardTitle>
            </CardHeader>
            {description && (
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">{description}</p>
              </CardContent>
            )}
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs leading-relaxed font-medium mb-1">{tooltipTitle}</p>
          <p className="text-xs leading-relaxed">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
