/**
 * Компонент автокомплита для города
 * Переиспользуемый компонент для выбора города с автодополнением
 */

"use client";

import type { CitySuggestion } from "@/modules/shipping/lib/geocoding/types";
import { useCitySuggestions } from "@/shared/hooks/shipping/useCitySuggestions";
import React from "react";
import { BaseAutocomplete } from "./base-autocomplete";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: CitySuggestion) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  onSelect,
  disabled,
  placeholder = "Введите название города",
  className,
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  const { data: suggestions, isLoading } = useCitySuggestions(inputValue, isOpen && !disabled);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  React.useEffect(() => {
    if (inputValue.length >= 2) {
      setIsOpen(true);
    }
  }, [inputValue]);

  return (
    <BaseAutocomplete<CitySuggestion>
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      items={suggestions}
      isLoading={isLoading}
      minQueryLength={2}
      getItemValue={(item) => item.city}
      renderItem={(suggestion, index, handleSelect) => (
        <li
          key={index}
          className="cursor-pointer px-3 py-2 text-xs hover:bg-muted"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSelect(suggestion);
          }}
        >
          <div className="font-medium">{suggestion.city}</div>
          <div className="text-muted-foreground">
            {suggestion.region}, {suggestion.country}
          </div>
        </li>
      )}
    />
  );
}
