"use client";

import { cn } from "@/shared/lib/utils";
import { formatDateISO, parseDateString } from "@/shared/lib/validation";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { ru } from "react-day-picker/locale";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export type DatePickerProps = {
  /** Текущее значение в формате YYYY-MM-DD */
  value?: string;
  /** Callback при изменении даты (формат YYYY-MM-DD) */
  onChange?: (value: string) => void;
  /** Placeholder когда дата не выбрана */
  placeholder?: string;
  /** Заблокировать выбор */
  disabled?: boolean;
  /** Минимальная дата */
  minDate?: Date;
  /** Максимальная дата */
  maxDate?: Date;
  /** Ошибка валидации */
  error?: boolean;
  /** Дополнительные классы для кнопки-триггера */
  className?: string;
  /** ID для связи с label */
  id?: string;
  /** Кастомный формат отображения даты (по умолчанию DD.MM.YYYY) */
  displayFormat?: (date: Date) => string;
};

/**
 * DatePicker — выбор даты через Popover + Calendar.
 * Отображает дату в формате DD.MM.YYYY, возвращает YYYY-MM-DD.
 */
function defaultDisplayFormat(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Выберите дату",
  disabled = false,
  minDate,
  maxDate,
  error = false,
  className,
  id,
  displayFormat = defaultDisplayFormat,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Парсим value (YYYY-MM-DD) в Date для Calendar
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    return parseDateString(value) ?? undefined;
  }, [value]);

  // Обработчик выбора даты в календаре
  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      if (date) {
        onChange?.(formatDateISO(date));
      } else {
        onChange?.("");
      }
      setOpen(false);
    },
    [onChange]
  );

  // Текст для отображения в кнопке
  const displayText = selectedDate ? displayFormat(selectedDate) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={error}
          className={cn(
            "h-11 w-full justify-start rounded-[10px] border border-input bg-background px-3 text-left text-[16px] font-normal leading-[130%]",
            "hover:bg-background focus:ring-2 focus:ring-primary/20",
            !selectedDate && "text-muted-foreground",
            error && "border-destructive",
            disabled && "opacity-70 cursor-not-allowed",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          locale={ru}
          captionLayout="dropdown"
          fromYear={1920}
          toYear={new Date().getFullYear()}
          defaultMonth={selectedDate ?? new Date()}
          classNames={{
            // Стилизация под цвета магазина
            day: "relative w-full h-full p-0 text-center group/day aspect-square select-none",
            today: "bg-primary/10 text-primary rounded-md",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
