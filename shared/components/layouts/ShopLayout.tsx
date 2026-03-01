"use client";

import { CookieConsentBanner, Footer, Header } from "@/shared/components/common";
import { ShopErrorBoundary } from "@/shared/components/error-boundaries/ShopErrorBoundary";
import { ShopNavProvider } from "@/shared/contexts";
import { NewsletterModalProvider } from "@/shared/contexts/newsletter-modal-context";
import { cn } from "@/shared/lib/utils";
/**
 * Общий layout магазина: Header, Footer, провайдеры.
 * Error Boundary оборачивает только контент страницы — тогда Fast Refresh не делает
 * full reload при правках компонентов внутри страницы (родитель остаётся функциональным).
 */
export function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={cn("shop min-h-screen background")}>
      <div className="relative">
        <ShopNavProvider>
          <NewsletterModalProvider>
            <Header />
            <ShopErrorBoundary>
              <div className="min-h-[50vh]">{children}</div>
            </ShopErrorBoundary>
            <Footer />
          </NewsletterModalProvider>
        </ShopNavProvider>
        <CookieConsentBanner />
      </div>
    </main>
  );
}
