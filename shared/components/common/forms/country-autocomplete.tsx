/**
 * Компонент автокомплита для страны
 * Переиспользуемый компонент для выбора страны с автодополнением
 */

"use client";

import type { CountrySuggestion } from "@/modules/shipping/lib/geocoding/types";
import { useCountrySuggestions } from "@/shared/hooks/shipping/useCountrySuggestions";
import React from "react";
import { BaseAutocomplete } from "./base-autocomplete";

interface CountryAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: CountrySuggestion) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CountryAutocomplete({
  value,
  onChange,
  onSelect,
  disabled,
  placeholder = "Введите название страны",
  className,
}: CountryAutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);
  const { data: suggestions, isLoading } = useCountrySuggestions(inputValue, isOpen && !disabled);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  React.useEffect(() => {
    if (inputValue.length >= 2) {
      setIsOpen(true);
    }
  }, [inputValue]);

  return (
    <BaseAutocomplete<CountrySuggestion>
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      items={suggestions}
      isLoading={isLoading}
      minQueryLength={2}
      getItemValue={(item) => item.value}
      renderItem={(suggestion, index, handleSelect) => (
        <li
          key={index}
          className="cursor-pointer px-3 py-2 text-[14px] hover:bg-muted"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSelect(suggestion);
          }}
        >
          {suggestion.value}
        </li>
      )}
    />
  );
}
