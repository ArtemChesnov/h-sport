"use client";

import { cn } from "@/shared/lib";

interface ProductVariantSelectorProps {
  title: string;
  options: string[];
  value: string | null;
  onChange: (option: string) => void;
}

/**
 * Выбор варианта товара (цвет, размер и т.д.).
 */
export function ProductVariantSelector({
  title,
  options,
  value,
  onChange,
}: ProductVariantSelectorProps) {
  if (options.length <= 1) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200",
              value === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
