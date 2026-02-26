"use client";

import { Button, Input, Label, Spinner } from "@/shared/components/ui";
import { usePromoCodeInput } from "@/shared/hooks/promo/use-promo-code-input";
import type { DTO } from "@/shared/services";
import React from "react";

type CartPromoFormProps = {
  subtotal: number;
  appliedCode?: string | null;
  onApplied?: (cart: DTO.CartDto) => void;
  onCleared?: (cart: DTO.CartDto) => void;
};

export const CartPromoForm: React.FC<CartPromoFormProps> = ({
  subtotal,
  appliedCode,
  onApplied,
  onCleared,
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
  } = usePromoCodeInput({ subtotal, appliedCode, onApplied, onCleared });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleApply();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5 p-[30px]">
      <Label className="text-[12px] text-muted-foreground">Введите промокод</Label>

      <div className="flex rounded-[6px] border border-neutral-300 overflow-hidden bg-white">
        <Input
          value={inputValue}
          onChange={handleChange}
          disabled={isLocked || isApplying || isClearing}
          placeholder="PROMOCODE"
          className="h-11 text-[12px] flex-1 border-0 rounded-none focus-visible:ring-0 focus-visible:border-0"
        />

        {isLocked ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isClearing}
            className="h-11 px-3 text-xs rounded-none border-l border-neutral-300 border-t-0 border-r-0 border-b-0"
          >
            {isClearing ? <Spinner className="h-4 w-4" /> : "✕"}
          </Button>
        ) : (
          <Button
            type="submit"
            size="sm"
            disabled={isApplying}
            className="h-11 px-4 text-[14px] uppercase tracking-wide rounded-none border-0 bg-[#EB6081] hover:bg-[#d8859d] text-white"
          >
            {isApplying ? <Spinner className="h-4 w-4" /> : "Получить скидку"}
          </Button>
        )}
      </div>

      {errorText && <p className="text-[11px] leading-snug text-destructive">{errorText}</p>}
    </form>
  );
};
