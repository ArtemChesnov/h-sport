"use client";

import { cn } from "@/shared/lib/utils";
import { Spinner } from "./spinner";

interface ContentLoaderProps {
  /** Текст под спиннером */
  text?: string;
  /** Дополнительные классы для контейнера */
  className?: string;
  /** Размер спиннера */
  size?: "sm" | "md" | "lg";
  /** Показывать как оверлей (fixed) или как блок (flex) */
  variant?: "overlay" | "block";
}

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * Унифицированный лоадер для области контента.
 * Используется при переключении страниц, загрузке данных и т.д.
 *
 * @example
 * // Оверлей на всю страницу
 * <ContentLoader variant="overlay" text="Загрузка..." />
 *
 * @example
 * // Блок в области контента
 * <ContentLoader variant="block" className="min-h-[50vh]" />
 */
export function ContentLoader({
  text = "Загрузка...",
  className,
  size = "md",
  variant = "block",
}: ContentLoaderProps) {
  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm",
          className
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <Spinner className={cn(sizeClasses[size], "text-primary")} />
          {text && (
            <span className="text-sm text-muted-foreground">{text}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <Spinner className={cn(sizeClasses[size], "text-primary")} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
