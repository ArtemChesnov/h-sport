import { CookieConsentBanner, Footer, Header } from "@/shared/components/common";
import { ShopNavProvider } from "@/shared/contexts";
import { NewsletterModalProvider } from "@/shared/contexts/newsletter-modal-context";
import { cn } from "@/shared/lib/utils";
/**
 * Общий layout магазина: Header, Footer, провайдеры.
 * Используется в app/(shop)/layout и в app/cart, app/catalog для единого UI.
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
            <div className="min-h-[50vh]">{children}</div>
            <Footer />
          </NewsletterModalProvider>
        </ShopNavProvider>
        <CookieConsentBanner />
      </div>
    </main>
  );
}
