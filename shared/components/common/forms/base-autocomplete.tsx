/**
 * Базовый компонент для автокомплитов
 * Используется как основа для CityAutocomplete и CountryAutocomplete
 */

"use client";

import { INPUT_FIELD_CLASS } from "@/shared/constants";
import React from "react";

interface BaseAutocompleteProps<T> {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: T) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  items: T[] | undefined;
  isLoading: boolean;
  minQueryLength?: number;
  getItemValue: (item: T) => string;
  renderItem: (item: T, index: number, onSelect: (item: T) => void) => React.ReactNode;
  emptyMessage?: string;
}

export function BaseAutocomplete<T>({
  value,
  onChange,
  onSelect,
  disabled,
  placeholder,
  className,
  items,
  isLoading,
  minQueryLength = 2,
  getItemValue,
  renderItem,
  emptyMessage = "Ничего не найдено",
}: BaseAutocompleteProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelect = (item: T) => {
    const selectedValue = getItemValue(item);
    setInputValue(selectedValue);
    onChange(selectedValue);
    setIsOpen(false);
    onSelect?.(item);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // Задержка для обработки клика по suggestion
          // Используем requestAnimationFrame для оптимизации
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsOpen(false);
            });
          });
        }}
        disabled={disabled}
        className={INPUT_FIELD_CLASS}
        placeholder={placeholder}
      />
      {isOpen && inputValue.length >= minQueryLength && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs text-muted-foreground">Загрузка...</span>
              </div>
            </div>
          ) : items && items.length > 0 ? (
            <ul className="py-1">
              {items.map((item, index) => renderItem(item, index, handleSelect))}
            </ul>
          ) : (
            <div className="p-2 text-xs text-muted-foreground">{emptyMessage}</div>
          )}
        </div>
      )}
    </div>
  );
}
