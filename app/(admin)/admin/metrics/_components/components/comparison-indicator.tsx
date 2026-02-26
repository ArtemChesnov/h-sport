/**
 * Индикатор сравнения с предыдущим периодом
 */

import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface ComparisonIndicatorProps {
  current: number;
  previous?: number;
  /** Если true, то падение = хорошо (зеленый), рост = плохо (красный) */
  inverted?: boolean;
}

export function ComparisonIndicator({
  current,
  previous,
  inverted = false
}: ComparisonIndicatorProps) {
  if (!previous || previous === 0) return null;

  const change = ((current - previous) / previous) * 100;
  const absChange = Math.abs(change);

  if (absChange < 0.01) return <Minus className="h-3 w-3 text-muted-foreground" />;

  // Для инвертированных метрик (время ответа, процент ошибок):
  // падение = хорошо (зеленый), рост = плохо (красный)
  // Для обычных метрик (количество запросов):
  // рост = хорошо (зеленый), падение = плохо (красный)
  const isPositive = inverted ? change < 0 : change > 0;

  if (isPositive) {
    return (
      <div className="flex items-center gap-1 text-emerald-600">
        {inverted ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
        <span className="text-xs font-medium">{absChange.toFixed(1)}%</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-600">
      {inverted ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      <span className="text-xs font-medium">{absChange.toFixed(1)}%</span>
    </div>
  );
}
