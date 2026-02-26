"use client";

import { INPUT_FIELD_CLASS } from "@/shared/constants";
import { Eye, EyeOff } from "lucide-react";
import React from "react";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id?: string;
  error?: string;
}

/**
 * Поле ввода пароля с кнопкой показа/скрытия.
 */
export function PasswordInput({ id, error, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className={`${INPUT_FIELD_CLASS} pr-10 ${className ?? ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity cursor-pointer"
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 stroke-[#EB6081] stroke-[1.5]" />
          ) : (
            <Eye className="h-5 w-5 stroke-[#EB6081] stroke-[1.5]" />
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
