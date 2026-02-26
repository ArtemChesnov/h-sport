"use client";

import { TOAST } from "@/shared/constants";
import { useApplyPromoCodeMutation, useClearPromoCodeMutation } from "@/shared/hooks/promo/promo.hooks";
import { extractBackendErrorPayload } from "@/shared/lib/validation";
import type { DTO } from "@/shared/services";
import { useState } from "react";
import { toast } from "sonner";

export type UsePromoCodeInputOptions = {
  subtotal: number;
  appliedCode?: string | null;
  onApplied?: (cart: DTO.CartDto) => void;
  onCleared?: (cart: DTO.CartDto) => void;
};

/**
 * Общая логика ввода и применения промокода для корзины.
 * Используется в CartPromoForm и CartSummaryPromoInput; разметка остаётся в компонентах.
 */
export function usePromoCodeInput({
  subtotal,
  appliedCode,
  onApplied,
  onCleared,
}: UsePromoCodeInputOptions) {
  const [draftCode, setDraftCode] = useState<string>(() => appliedCode ?? "");
  const [errorText, setErrorText] = useState<string | null>(null);

  const applyPromo = useApplyPromoCodeMutation();
  const clearPromo = useClearPromoCodeMutation();

  const isLocked = Boolean(appliedCode);
  const isApplying = applyPromo.isPending;
  const isClearing = clearPromo.isPending;

  const inputValue = isLocked ? (appliedCode ?? "") : draftCode;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isLocked) return;
    setDraftCode(e.target.value);
    if (errorText) setErrorText(null);
  }

  function handleApply() {
    if (isLocked || isApplying) return;

    const trimmed = draftCode.trim().toUpperCase();

    if (!trimmed) {
      setErrorText("Введи код промокода.");
      return;
    }

    if (subtotal <= 0) {
      setErrorText("Сначала добавь товары в корзину.");
      return;
    }

    setErrorText(null);

    applyPromo.mutate(
      { code: trimmed },
      {
        onSuccess: (cart) => {
          const discount = cart.discount ?? 0;
          toast.success(TOAST.SUCCESS.PROMO_APPLIED, {
            description:
              discount > 0
                ? `Скидка: ${(discount / 100).toLocaleString("ru-RU", {
                    maximumFractionDigits: 0,
                  })} ₽`
                : undefined,
          });
          onApplied?.(cart);
        },
        onError: (error) => {
          const { message, errors } = extractBackendErrorPayload(error);
          const fieldMessage =
            errors?.find((e) => e.field === "code" || e.field === "_global")?.message ??
            message ??
            "Не удалось применить промокод.";
          setErrorText(fieldMessage);
          toast.error("Ошибка промокода ❌", { description: fieldMessage });
        },
      }
    );
  }

  function handleClear() {
    if (!appliedCode) {
      setDraftCode("");
      setErrorText(null);
      return;
    }

    if (isClearing) return;

    clearPromo.mutate(undefined, {
      onSuccess: (cart) => {
        setDraftCode("");
        setErrorText(null);
        toast.success(TOAST.SUCCESS.PROMO_CLEARED);
        onCleared?.(cart);
      },
      onError: (error) => {
        const { message } = extractBackendErrorPayload(error);
        const msg = message || "Не удалось сбросить промокод.";
        toast.error(TOAST.ERROR.GENERIC, { description: msg });
      },
    });
  }

  return {
    draftCode,
    setDraftCode,
    errorText,
    inputValue,
    handleChange,
    handleApply,
    handleClear,
    isLocked,
    isApplying,
    isClearing,
  };
}
