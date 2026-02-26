"use client";

import { cn } from "@/shared/lib";

type FieldErrorProps = {
  message?: string;
  className?: string;
};

/**
 * Унифицированный компонент для отображения ошибок валидации обязательных полей
 */
export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className={cn("mt-1 text-xs text-destructive", className)}>
      {message}
    </p>
  );
}
