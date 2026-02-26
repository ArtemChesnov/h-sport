"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Показывает тосты при редиректе с /api/shop/newsletter/confirm и unsubscribe.
 */
export function NewsletterToastHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("newsletter");
    if (!status) return;

    switch (status) {
      case "confirmed":
        toast.success("Подписка подтверждена. Спасибо!");
        break;
      case "confirm_error":
        toast.error("Ссылка недействительна или уже использована.");
        break;
      case "unsubscribed":
        toast.success("Вы отписаны от рассылки.");
        break;
      case "unsubscribe_error":
        toast.error("Ссылка недействительна или уже использована.");
        break;
      default:
        break;
    }

    // Убираем query из URL без перезагрузки
    const url = new URL(window.location.href);
    url.searchParams.delete("newsletter");
    const clean = url.pathname + url.search;
    if (clean !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", clean);
    }
  }, [searchParams]);

  return null;
}
