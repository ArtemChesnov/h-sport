"use client";

import { Button } from "@/shared/components/ui";

type PeriodOption = "1d" | "7d" | "30d" | "90d";

/**
 * Кнопки переключения периода для Web Vitals (1 / 7 / 30 / 90 дней)
 */
export function WebVitalsPeriodSwitcher(props: {
  period: PeriodOption;
  onChange: (period: PeriodOption) => void;
}) {
  const { period, onChange } = props;

  const options: { value: PeriodOption; label: string }[] = [
    { value: "1d", label: "1 день" },
    { value: "7d", label: "7 дней" },
    { value: "30d", label: "30 дней" },
    { value: "90d", label: "90 дней" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1 shadow-sm">
      {options.map((opt) => {
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
