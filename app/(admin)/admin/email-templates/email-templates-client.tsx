"use client";

/**
 * Клиентский блок: табы с превью шаблонов писем.
 * HTML загружается через fetch и подставляется origin страницы (__ORIGIN__ → window.location.origin),
 * чтобы логотип и ссылки не вели на недоступный IP (например 172.x).
 */

import React from "react";

const ORIGIN_PLACEHOLDER = "__ORIGIN__";

type Template = { id: string; label: string };

export function EmailTemplatesClient({ templates }: { templates: Template[] }) {
  const [active, setActive] = React.useState(templates[0]?.id ?? "");
  const [html, setHtml] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!active) return;
    setLoading(true);
    setError(null);
    const url = `/api/admin/email-templates/preview?template=${encodeURIComponent(active)}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Нужна авторизация" : `Ошибка ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setHtml(text.replaceAll(ORIGIN_PLACEHOLDER, origin));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [active]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-3">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active === t.id
                ? "bg-indigo-600 text-white"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border/50 bg-slate-100/50 p-4 shadow-inner">
        <p className="mb-2 text-xs text-muted-foreground">
          Превью: {templates.find((t) => t.id === active)?.label}
        </p>
        <div className="overflow-hidden rounded-lg border border-border/50 bg-white shadow-sm">
          <div className="h-[720px] w-full min-w-0 overflow-auto bg-[#f8f8f8]">
            {loading && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Загрузка…
              </div>
            )}
            {error && (
              <div className="flex h-full items-center justify-center text-destructive">
                {error}
              </div>
            )}
            {!loading && !error && html && (
              <div
                className="min-h-full p-4"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
