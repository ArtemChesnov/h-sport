"use client";

import { ErrorFallbackBlock } from "@/shared/components/common";
import { useEffect } from "react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("/api/errors/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          url: window.location.href,
          context: "shop",
        }),
      }).catch(() => {});
    }
  }, [error]);

  return (
    <ErrorFallbackBlock
      title="Что-то пошло не так"
      description="Произошла ошибка при загрузке страницы. Попробуйте обновить страницу или вернуться позже."
      onRetry={reset}
      secondaryAction={{ href: "/", label: "На главную" }}
      minHeight="60vh"
      error={error}
    />
  );
}
