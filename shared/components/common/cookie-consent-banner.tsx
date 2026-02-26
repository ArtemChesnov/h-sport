"use client";

import { DesignButton } from "@/shared/components/ui";
import {
    COOKIE_CONSENT_ACCEPTED,
    COOKIE_CONSENT_REJECTED,
    COOKIE_CONSENT_STORAGE_KEY,
} from "@/shared/lib/cookie-consent";
import Link from "next/link";
import * as React from "react";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (stored !== COOKIE_CONSENT_ACCEPTED && stored !== COOKIE_CONSENT_REJECTED) {
      setIsVisible(true);
    }
  }, []);

  const saveAndClose = React.useCallback((value: typeof COOKIE_CONSENT_ACCEPTED | typeof COOKIE_CONSENT_REJECTED) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
    setIsVisible(false);
  }, []);

  const handleAccept = React.useCallback(() => saveAndClose(COOKIE_CONSENT_ACCEPTED), [saveAndClose]);
  const handleReject = React.useCallback(() => saveAndClose(COOKIE_CONSENT_REJECTED), [saveAndClose]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Уведомление об использовании cookie"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-4 sm:px-6 sm:py-5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto max-w-[1400px] w-full rounded-[10px] border border-[rgb(220,220,220)] bg-white px-4 py-4 sm:px-6 sm:py-5 shop">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-[14px] leading-[140%] text-foreground sm:text-[16px]">
              <strong>Обязательные cookie</strong> (корзина, авторизация, безопасность) —
              необходимы для работы сайта и используются всегда.
            </p>
            <p className="text-[14px] leading-[140%] text-foreground sm:text-[16px]">
              <strong>Необязательные cookie</strong> (аналитика) — только с вашего согласия.{" "}
              <Link
                href="/privacy"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                Политика конфиденциальности
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <DesignButton
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="h-11 px-5"
            >
              Отклонить
            </DesignButton>
            <DesignButton
              variant="default"
              size="sm"
              onClick={handleAccept}
              className="h-11 px-6"
            >
              Принять
            </DesignButton>
          </div>
        </div>
      </div>
    </div>
  );
}
