"use client";

import { Button } from "@/shared/components/ui";

type PeriodOption = 15 | 60 | 360 | 1440 | 10080 | 43200; // минуты: 15м, 1ч, 6ч, 24ч, 7д, 30д

const PERIOD_OPTIONS: Array<{ value: PeriodOption; label: string }> = [
  { value: 15, label: "15 мин" },
  { value: 60, label: "1 час" },
  { value: 360, label: "6 часов" },
  { value: 1440, label: "24 часа" },
  { value: 10080, label: "7 дней" },
  { value: 43200, label: "30 дней" },
];

/**
 * Селектор периода в минутах (для API метрик)
 * Единый стиль с основным селектором
 */
export function PeriodSwitcherMinutes(props: {
  period: PeriodOption;
  onChange: (period: PeriodOption) => void;
}) {
  const { period, onChange } = props;

  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1 shadow-sm">
      {PERIOD_OPTIONS.map((opt) => {
        const isActive = opt.value === period;
        return (
          <Button
            key={opt.value}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={`h-8 px-3 text-xs font-medium transition-all ${
              isActive
                ? "bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}
