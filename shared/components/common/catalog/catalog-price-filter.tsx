/**
 * Компонент фильтра по цене
 * Полностью контролируемый компонент (best practices)
 * Использует debounce для инпутов
 */

import { Slider } from "@/shared/components/ui/slider";
import { useDebouncedCallback } from "@/shared/hooks";
import React from "react";

type CatalogPriceFilterProps = {
  priceRange: { min: number; max: number };
  currentPriceFrom?: number;
  currentPriceTo?: number;
  onPriceChange: (priceFrom?: number, priceTo?: number) => void;
  isLoading?: boolean;
};

export function CatalogPriceFilter({
  priceRange,
  currentPriceFrom,
  currentPriceTo,
  onPriceChange,
  isLoading,
}: CatalogPriceFilterProps) {
  // Debounced версия onPriceChange только для инпутов
  const debouncedPriceChange = useDebouncedCallback(onPriceChange, 300);

  // Локальное состояние для слайдера - источник истины во время взаимодействия
  // Инициализируем из props
  const [localFrom, setLocalFrom] = React.useState<number>(() => currentPriceFrom ?? priceRange.min);
  const [localTo, setLocalTo] = React.useState<number>(() => currentPriceTo ?? priceRange.max);

  // Флаг активного взаимодействия (drag или pending URL update)
  const [isInteracting, setIsInteracting] = React.useState(false);

  // Ref для отслеживания pending значений (ожидаем обновления URL)
  const pendingValuesRef = React.useRef<{ from?: number; to?: number } | null>(null);

  // Синхронизируем локальное состояние с props ТОЛЬКО когда:
  // 1. Нет активного взаимодействия
  // 2. Или props совпали с pending значениями (URL обновился)
  React.useEffect(() => {
    const pending = pendingValuesRef.current;

    // Если есть pending значения и props совпали - значит URL обновился
    if (pending) {
      const propsFrom = currentPriceFrom ?? priceRange.min;
      const propsTo = currentPriceTo ?? priceRange.max;
      const pendingFrom = pending.from ?? priceRange.min;
      const pendingTo = pending.to ?? priceRange.max;

      if (propsFrom === pendingFrom && propsTo === pendingTo) {
        // URL обновился, очищаем pending и завершаем взаимодействие
        pendingValuesRef.current = null;
        setIsInteracting(false);
      }
    }

    // Синхронизируем локальное состояние с props только если нет взаимодействия
    if (!isInteracting) {
      setLocalFrom(currentPriceFrom ?? priceRange.min);
      setLocalTo(currentPriceTo ?? priceRange.max);
    }
  }, [currentPriceFrom, currentPriceTo, priceRange.min, priceRange.max, isInteracting]);

  // Значения для слайдера - всегда используем локальное состояние
  const sliderFrom = localFrom;
  const sliderTo = localTo;

  // Временное состояние для инпутов только во время ввода
  const [inputFromValue, setInputFromValue] = React.useState<string>("");
  const [inputToValue, setInputToValue] = React.useState<string>("");
  const [isFromFocused, setIsFromFocused] = React.useState(false);
  const [isToFocused, setIsToFocused] = React.useState(false);

  // Синхронизируем значения инпутов при изменении слайдера (когда не в фокусе)
  React.useEffect(() => {
    if (!isFromFocused) {
      setInputFromValue(localFrom !== priceRange.min ? Math.round(localFrom / 100).toString() : "");
    }
  }, [localFrom, isFromFocused, priceRange.min]);

  React.useEffect(() => {
    if (!isToFocused) {
      setInputToValue(localTo !== priceRange.max ? Math.round(localTo / 100).toString() : "");
    }
  }, [localTo, isToFocused, priceRange.max]);

  // Обработчик изменения слайдера во время drag
  // Обновляет только локальное состояние для плавного UI
  const handleSliderChange = React.useCallback((values: number[]) => {
    const [from, to] = values;
    setIsInteracting(true);
    setLocalFrom(from);
    setLocalTo(to);
  }, []);

  // Обработчик коммита значений слайдера (после окончания drag)
  const handleSliderCommit = React.useCallback((values: number[]) => {
    const [from, to] = values;

    // Обновляем локальное состояние
    setLocalFrom(from);
    setLocalTo(to);

    // Нормализуем крайние значения → undefined для фильтра
    const normalizedFrom = from === priceRange.min ? undefined : from;
    const normalizedTo = to === priceRange.max ? undefined : to;

    // Сохраняем pending значения - будем ждать пока URL обновится
    pendingValuesRef.current = { from: normalizedFrom, to: normalizedTo };

    // Вызываем onPriceChange напрямую (без debounce - commit уже "throttled")
    onPriceChange(normalizedFrom, normalizedTo);
  }, [onPriceChange, priceRange.min, priceRange.max]);

  // Обработчик blur для поля "От"
  const handleFromBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFromFocused(false);
    const inputValue = e.target.value.trim();

    if (inputValue === "") {
      setInputFromValue("");
      const newFrom = priceRange.min;
      // Обновляем локальное состояние
      setLocalFrom(newFrom);
      setIsInteracting(true);
      // Устанавливаем pending и вызываем callback
      const normalizedFrom = undefined;
      const normalizedTo = localTo === priceRange.max ? undefined : localTo;
      pendingValuesRef.current = { from: normalizedFrom, to: normalizedTo };
      debouncedPriceChange(normalizedFrom, normalizedTo);
      return;
    }

    const valueInRubles = Number(inputValue);
    if (Number.isNaN(valueInRubles) || valueInRubles < 0) {
      // Невалидное значение - возвращаем к текущему
      setInputFromValue(localFrom !== priceRange.min ? Math.round(localFrom / 100).toString() : "");
      return;
    }

    const valueInKopecks = valueInRubles * 100;
    // Ограничиваем: не меньше min, не больше текущего "До"
    const newFrom = Math.max(
      priceRange.min,
      Math.min(valueInKopecks, localTo),
    );

    setInputFromValue(Math.round(newFrom / 100).toString());
    setLocalFrom(newFrom);
    setIsInteracting(true);

    const normalizedFrom = newFrom === priceRange.min ? undefined : newFrom;
    const normalizedTo = localTo === priceRange.max ? undefined : localTo;
    pendingValuesRef.current = { from: normalizedFrom, to: normalizedTo };
    debouncedPriceChange(normalizedFrom, normalizedTo);
  }, [localFrom, localTo, priceRange.min, priceRange.max, debouncedPriceChange]);

  // Обработчик blur для поля "До"
  const handleToBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsToFocused(false);
    const inputValue = e.target.value.trim();

    if (inputValue === "") {
      setInputToValue("");
      const newTo = priceRange.max;
      // Обновляем локальное состояние
      setLocalTo(newTo);
      setIsInteracting(true);
      // Устанавливаем pending и вызываем callback
      const normalizedFrom = localFrom === priceRange.min ? undefined : localFrom;
      const normalizedTo = undefined;
      pendingValuesRef.current = { from: normalizedFrom, to: normalizedTo };
      debouncedPriceChange(normalizedFrom, normalizedTo);
      return;
    }

    const valueInRubles = Number(inputValue);
    if (Number.isNaN(valueInRubles) || valueInRubles < 0) {
      // Невалидное значение - возвращаем к текущему
      setInputToValue(localTo !== priceRange.max ? Math.round(localTo / 100).toString() : "");
      return;
    }

    const valueInKopecks = valueInRubles * 100;
    // Ограничиваем: не больше max, не меньше текущего "От"
    const newTo = Math.min(
      priceRange.max,
      Math.max(valueInKopecks, localFrom),
    );

    setInputToValue(Math.round(newTo / 100).toString());
    setLocalTo(newTo);
    setIsInteracting(true);

    const normalizedFrom = localFrom === priceRange.min ? undefined : localFrom;
    const normalizedTo = newTo === priceRange.max ? undefined : newTo;
    pendingValuesRef.current = { from: normalizedFrom, to: normalizedTo };
    debouncedPriceChange(normalizedFrom, normalizedTo);
  }, [localFrom, localTo, priceRange.min, priceRange.max, debouncedPriceChange]);

  // Значения для отображения в инпутах (используем локальное состояние)
  const displayFrom = isFromFocused
    ? inputFromValue
    : (localFrom !== priceRange.min ? Math.round(localFrom / 100).toString() : "");

  const displayTo = isToFocused
    ? inputToValue
    : (localTo !== priceRange.max ? Math.round(localTo / 100).toString() : "");

  return (
    <div className="mb-6">
      {isLoading ? (
        <div className="h-[27px] w-16 bg-accent animate-pulse rounded mb-3" />
      ) : (
        <h3 className="text-[18px] font-regular text-[#1f1e1e] mb-3">Цена</h3>
      )}
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-2 bg-accent animate-pulse rounded-full" />
          <div className="flex gap-2 pt-2">
            <div className="flex-1 h-10 bg-accent animate-pulse rounded-lg" />
            <div className="flex-1 h-10 bg-accent animate-pulse rounded-lg" />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Slider
            value={[sliderFrom, sliderTo]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            min={priceRange.min}
            max={priceRange.max}
            step={100}
            className="w-full [&_[data-slot=slider-range]]:bg-[#EB6081] [&_[data-slot=slider-thumb]]:border-[#EB6081] [&_[data-slot=slider-thumb]]:ring-[#EB6081]/50 [&_[data-slot=slider-thumb]]:hover:ring-[#EB6081] [&_[data-slot=slider-thumb]]:focus-visible:ring-[#EB6081]"
          />
          <div className="flex gap-2 pt-2">
            <input
              type="number"
              placeholder="От"
              value={displayFrom}
              onChange={(e) => {
                setInputFromValue(e.target.value);
              }}
              onFocus={() => {
                setIsFromFocused(true);
                setInputFromValue(localFrom !== priceRange.min ? Math.round(localFrom / 100).toString() : "");
              }}
              onBlur={handleFromBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EB6081] focus:border-transparent transition-all duration-150 cursor-text"
            />
            <input
              type="number"
              placeholder="До"
              value={displayTo}
              onChange={(e) => {
                setInputToValue(e.target.value);
              }}
              onFocus={() => {
                setIsToFocused(true);
                setInputToValue(localTo !== priceRange.max ? Math.round(localTo / 100).toString() : "");
              }}
              onBlur={handleToBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EB6081] focus:border-transparent transition-all duration-150 cursor-text"
            />
          </div>
        </div>
      )}
    </div>
  );
}
