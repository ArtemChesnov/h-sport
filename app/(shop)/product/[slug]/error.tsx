"use client";

import { Container, ErrorFallbackBlock, ShopBreadcrumbs } from "@/shared/components/common";
import { CTA } from "@/shared/constants";
import { useEffect } from "react";

/**
 * Локальный error boundary для страницы товара.
 * Любая необработанная ошибка (в т.ч. при загрузке динамического ProductSlugClient)
 * показывается как «Товар не найден» с переходом в каталог, а не 500.
 */
export default function ProductSlugError({
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
          context: "product-slug",
        }),
      }).catch(() => {});
    }
  }, [error]);

  return (
    <div className="pb-20">
      <Container>
        <ShopBreadcrumbs />
        <ErrorFallbackBlock
          title="Товар не найден"
          description="Не удалось загрузить страницу товара. Попробуйте обновить страницу или перейти в каталог."
          onRetry={reset}
          secondaryAction={{ href: "/catalog", label: CTA.GO_TO_CATALOG }}
          minHeight="60vh"
          error={error}
        />
      </Container>
    </div>
  );
}
