
"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button, Calendar, Label, Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui";
import { formatRuDate } from "../../lib/promos";

/**
 * Кнопка выбора периода (shadcn Popover + Calendar range).
 * Состояние хранится в DateRange.
 */
export function PromoPeriodPicker(props: {
  value: DateRange | undefined;
  onChange: (next: DateRange | undefined) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { value, onChange, error, disabled } = props;
  const [open, setOpen] = useState(false);

  const label =
    value?.from && value?.to
      ? `${formatRuDate(value.from)} - ${formatRuDate(value.to)}`
      : value?.from
        ? `${formatRuDate(value.from)} - —`
        : "Выбрать период";

  return (
    <div className="space-y-2">
      <Label className={disabled ? "text-muted-foreground" : undefined}>
        Период действия (опционально)
      </Label>

      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          if (!disabled) {
            setOpen(nextOpen);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={disabled}
          >
            {label}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            className={disabled ? "pointer-events-none opacity-50" : undefined}
          />

          <div className="mt-3 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange(undefined)}
              disabled={disabled}
            >
              Очистить
            </Button>

            <Button
              type="button"
              variant="default"
              onClick={() => setOpen(false)}
              disabled={disabled}
            >
              Готово
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-muted-foreground">
        {disabled
          ? "Бессрочный промокод: действует с момента создания без даты окончания."
          : "Можно оставить пустым — тогда промокод будет без дат (логика на бэке)."}
      </p>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

