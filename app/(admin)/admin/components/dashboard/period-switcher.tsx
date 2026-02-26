"use client";

import { Button } from "@/shared/components/ui";
import { DTO } from "@/shared/services";

/**
 * Кнопки переключения периода (7 / 30 / 90 дней).
 * Единый стиль для всех селекторов периодов
 */
export function PeriodSwitcher(props: {
  period: DTO.AdminDashboardPeriodDto;
  onChange: (period: DTO.AdminDashboardPeriodDto) => void;
}) {
  const { period, onChange } = props;

  const options: { value: DTO.AdminDashboardPeriodDto; label: string }[] = [
    { value: "7d", label: "7 дней" },
    { value: "30d", label: "30 дней" },
    { value: "90d", label: "90 дней" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1 shadow-sm w-full sm:w-auto">
      {options.map((opt) => {
        const isActive = opt.value === period;
        return (
          <Button
            key={opt.value}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={`h-8 px-2 sm:px-3 text-xs font-medium transition-all flex-1 sm:flex-initial ${
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
