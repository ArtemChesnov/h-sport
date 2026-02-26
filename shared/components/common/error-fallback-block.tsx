"use client";

import {
  SHOP_ERROR_EMPTY_CONTAINER_CLASS,
  SHOP_ERROR_EMPTY_DESCRIPTION_CLASS,
  SHOP_ERROR_EMPTY_TITLE_CLASS,
  SHOP_ERROR_ICON_CLASS,
  SHOP_ERROR_ICON_WRAPPER_CLASS,
} from "@/shared/constants";
import { DesignButton } from "@/shared/components/ui/design-button";
import { cn } from "@/shared/lib";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export type ErrorFallbackBlockProps = {
  title?: string;
  description?: string;
  onRetry: () => void;
  /** Вторая кнопка: "На главную" или кастом */
  secondaryAction?: {
    href: string;
    label: string;
    icon?: LucideIcon;
  };
  /** Минимальная высота контейнера */
  minHeight?: "screen" | "60vh" | "40vh" | "auto";
  /** Показать детали ошибки (development) */
  error?: Error | null;
  className?: string;
};

/**
 * Унифицированный блок ошибки загрузки.
 * Единый стиль: иконка в круге, заголовок, описание, кнопки DesignButton.
 */
export function ErrorFallbackBlock({
  title = "Что-то пошло не так",
  description = "Произошла ошибка при загрузке страницы. Попробуйте обновить страницу или вернуться позже.",
  onRetry,
  secondaryAction = { href: "/", label: "На главную" },
  minHeight = "screen",
  error,
  className,
}: ErrorFallbackBlockProps) {
  const heightClass =
    minHeight === "screen"
      ? "min-h-screen"
      : minHeight === "60vh"
        ? "min-h-[60vh]"
        : minHeight === "40vh"
          ? "min-h-[40vh]"
          : "";
  const SecondaryIcon = secondaryAction.icon ?? Home;

  return (
    <div
      className={cn(
        SHOP_ERROR_EMPTY_CONTAINER_CLASS,
        heightClass,
        className
      )}
    >
      <div className="text-center space-y-6 max-w-md w-full">
        <div className={SHOP_ERROR_ICON_WRAPPER_CLASS}>
          <AlertTriangle className={SHOP_ERROR_ICON_CLASS} aria-hidden />
        </div>

        <div className="space-y-2">
          <h2 className={SHOP_ERROR_EMPTY_TITLE_CLASS}>{title}</h2>
          <p className={SHOP_ERROR_EMPTY_DESCRIPTION_CLASS}>{description}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <DesignButton
            onClick={onRetry}
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </DesignButton>
          <DesignButton variant="outline" asChild>
            <Link
              href={secondaryAction.href}
              className="inline-flex items-center gap-2"
            >
              <SecondaryIcon className="h-4 w-4" />
              {secondaryAction.label}
            </Link>
          </DesignButton>
        </div>

        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-text-secondary">
              Детали ошибки (только в development)
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded-[10px] text-xs overflow-auto text-foreground">
              {error.message}
              {"\n"}
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
