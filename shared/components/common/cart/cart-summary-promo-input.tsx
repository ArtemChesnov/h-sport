"use client";

import { Button, Input, Spinner } from "@/shared/components/ui";
import { DesignButton } from "@/shared/components/ui/design-button";
import { usePromoCodeInput } from "@/shared/hooks/promo/use-promo-code-input";
import { Ticket, X } from "lucide-react";
import React from "react";

type CartSummaryPromoInputProps = {
  subtotal: number;
  appliedCode?: string | null;
  onApplied?: () => void;
  onCleared?: () => void;
  /** Полностью отключить ввод и кнопки (например, на шаге завершения) */
  disabled?: boolean;
};

/**
 * Инпут для ввода промокода в summary card корзины и чекаута.
 */
export const CartSummaryPromoInput: React.FC<CartSummaryPromoInputProps> = ({
  subtotal,
  appliedCode,
  onApplied,
  onCleared,
  disabled = false,
}) => {
  const {
    inputValue,
    errorText,
    handleChange,
    handleApply,
    handleClear,
    isLocked,
    isApplying,
    isClearing,
  } = usePromoCodeInput({
    subtotal,
    appliedCode,
    onApplied: onApplied ? (_cart) => onApplied() : undefined,
    onCleared: onCleared ? (_cart) => onCleared() : undefined,
  });

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex rounded-[10px] border bg-[#EBEAEA] border-[#DCDCDC] w-full transition-[border-color,box-shadow] duration-200 ease-out has-[:focus-visible]:border-primary/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/20">
        <Input
          value={inputValue}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLocked) {
              e.preventDefault();
              handleApply();
            }
          }}
          disabled={disabled || isLocked || isApplying || isClearing}
          placeholder="Введите промокод"
          className="h-11 text-[16px] flex-1 border-0 rounded-l-[10px] rounded-r-none focus-visible:ring-0 focus-visible:border-0 w-full"
        />

        {isLocked ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={disabled || isClearing}
            aria-label="Сбросить промокод"
            className="h-11 min-w-[120px] px-8 text-base rounded-[10px] flex items-center justify-center max-[460px]:min-w-0 max-[460px]:px-3"
          >
            {isClearing ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                <span className="min-[461px]:inline hidden">Сбросить</span>
                <X className="h-5 w-5 max-[460px]:inline hidden" aria-hidden />
              </>
            )}
          </Button>
        ) : (
          <DesignButton
            type="button"
            variant="default"
            onClick={handleApply}
            disabled={disabled || isApplying}
            aria-label="Применить промокод"
            className="h-11 min-w-[120px] px-8 text-base rounded-[10px] border-0 flex items-center justify-center max-[460px]:min-w-0 max-[460px]:px-3"
          >
            {isApplying ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                <span className="min-[461px]:inline hidden">Применить</span>
                <Ticket className="h-5 w-5 max-[460px]:inline hidden" aria-hidden />
              </>
            )}
          </DesignButton>
        )}
      </div>

      {errorText && (
        <p className="text-[12px] text-destructive leading-snug animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {errorText}
        </p>
      )}
    </div>
  );
};
