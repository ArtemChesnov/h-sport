"use client";

import {
    DEFAULT_PAYMENT_ERROR_MESSAGE,
    PAYMENT_ERROR_MESSAGES,
} from "@/shared/constants";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Хук для обработки ошибок оплаты из query-параметра ?error=.
 * Показывает toast и очищает URL.
 */
export function usePaymentErrorFromUrl() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const errorParam = new URLSearchParams(window.location.search).get("error");
    if (errorParam) {
      const errorMessage =
        PAYMENT_ERROR_MESSAGES[errorParam] ?? DEFAULT_PAYMENT_ERROR_MESSAGE;
      toast.error(errorMessage);
      router.replace("/checkout", { scroll: false });
    }
  }, [router]);
}
