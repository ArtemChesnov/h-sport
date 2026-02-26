"use client";

import { TOAST } from "@/shared/constants";
import { useCallback } from "react";
import { toast } from "sonner";

interface UseCopyToClipboardOptions {
  /** Сообщение при успехе (по умолчанию "Скопировано") */
  successMessage?: string;
  /** Сообщение при ошибке (по умолчанию из TOAST.ERROR.FAILED_TO_COPY) */
  errorMessage?: string;
}

/**
 * Хук для копирования текста в буфер обмена с toast-уведомлением
 */
export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const {
    successMessage = "Скопировано",
    errorMessage = TOAST.ERROR.FAILED_TO_COPY,
  } = options;

  const copyToClipboard = useCallback(
    async (text: string, customSuccessMessage?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(customSuccessMessage ?? successMessage);
        return true;
      } catch {
        toast.error(errorMessage);
        return false;
      }
    },
    [successMessage, errorMessage],
  );

  return { copyToClipboard };
}
