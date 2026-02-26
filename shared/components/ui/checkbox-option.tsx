"use client";

import { cn } from "@/shared/lib";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface CheckboxOptionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  name?: string;
  className?: string;
}

/**
 * Кастомный чекбокс с розовым акцентом.
 * Используется в "Запомнить меня", согласиях и т.д.
 */
export function CheckboxOption({
  checked,
  onChange,
  label,
  name,
  className,
}: CheckboxOptionProps) {
  return (
    <label
      className={cn("flex cursor-pointer items-center gap-2 group", className)}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            "w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-150",
            checked
              ? "bg-[#EB6081] border-[#EB6081]"
              : "bg-white border-[#EB6081] group-hover:border-[#d8859d]"
          )}
        >
          {checked && (
            <Check className="h-3 w-3 text-white stroke-[2.5] animate-in fade-in-0 zoom-in-75 duration-150" />
          )}
        </div>
      </div>
      <span className="text-sm text-neutral-700">{label}</span>
    </label>
  );
}
