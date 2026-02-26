"use client";

import {
    COOKIE_CONSENT_ACCEPTED,
    getCookieConsent,
} from "@/shared/lib/cookie-consent";
import * as React from "react";

/**
 * Хук для доступа к статусу согласия на cookie.
 * Используйте при инициализации аналитики, маркетинговых скриптов и т.п.
 *
 * @example
 * const { hasChoice, acceptedNonEssential } = useCookieConsent();
 * useEffect(() => {
 *   if (hasChoice && acceptedNonEssential) {
 *     initAnalytics();
 *   }
 * }, [hasChoice, acceptedNonEssential]);
 */
export function useCookieConsent() {
  const [status, setStatus] = React.useState<ReturnType<typeof getCookieConsent>>(null);

  React.useEffect(() => {
    const update = () => setStatus(getCookieConsent());
    update();
    const handleChange = () => update();
    window.addEventListener("storage", handleChange);
    window.addEventListener("cookie-consent-change", handleChange);
    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("cookie-consent-change", handleChange);
    };
  }, []);

  return {
    status,
    hasChoice: status !== null,
    acceptedNonEssential: status === COOKIE_CONSENT_ACCEPTED,
  };
}
