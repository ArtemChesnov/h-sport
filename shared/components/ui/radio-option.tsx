"use client";

import { cn } from "@/shared/lib";

interface RadioOptionProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  className?: string;
}

/**
 * Кастомный радио-элемент с розовым акцентом.
 * Используется в способе доставки, способе оплаты и т.д.
 */
export function RadioOption({
  name,
  value,
  label,
  checked,
  onChange,
  className,
}: RadioOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 text-[16px] max-[1440px]:text-[14px] group",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-150",
            checked
              ? "bg-[#EB6081] border-[#EB6081]"
              : "bg-white border-[#EB6081] group-hover:border-[#d8859d]"
          )}
        >
          {checked && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
      <span>{label}</span>
    </label>
  );
}
