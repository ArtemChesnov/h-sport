"use client";

import { ErrorFallbackBlock } from "@/shared/components/common";
import { useEffect } from "react";

export default function Error({
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
        }),
      }).catch(() => {});
    }
  }, [error]);

  return (
    <ErrorFallbackBlock
      title="Что-то пошло не так"
      description="Произошла ошибка при загрузке страницы. Попробуйте обновить страницу или вернуться позже."
      onRetry={reset}
      minHeight="screen"
      error={error}
    />
  );
}
