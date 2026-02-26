"use client";

import { useEffect } from "react";

/**
 * Корневой error boundary (App Router).
 * Ловит ошибки в root layout и в дереве ниже; рендерит свой html/body, т.к. layout может быть сломан.
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      fetch("/api/errors/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          digest: error.digest,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          source: "global-error",
        }),
      }).catch(() => {});
    } catch {
      // best-effort: сервер может быть в нерабочем состоянии
    }
  }, [error]);

  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f5f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h1 style={{ fontSize: "1.25rem", color: "#333", marginBottom: 8 }}>
            Что-то пошло не так
          </h1>
          <p style={{ color: "#666", marginBottom: 24 }}>
            Критическая ошибка. Попробуйте обновить страницу или зайти позже.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              fontSize: 16,
              color: "#fff",
              background: "#EB6081",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Обновить страницу
          </button>
          <p style={{ marginTop: 24 }}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error renders outside Next.js context, Link unavailable */}
            <a href="/" style={{ color: "#EB6081", textDecoration: "none" }}>
              На главную
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}
