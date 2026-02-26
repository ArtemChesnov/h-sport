"use client";

import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import { CheckoutAddressProvider } from "@/shared/hooks/checkout/checkout-address-provider";
import { cn } from "@/shared/lib";
import { usePathname } from "next/navigation";
import React, { Suspense } from "react";
import { CheckoutPageSkeleton } from "./_components/checkout-skeletons";
import { CheckoutSteps } from "./_components/checkout-steps";
import { CheckoutSummaryCard } from "./_components/checkout-summary-card";

type CheckoutLayoutClientProps = {
  children: React.ReactNode;
};

/**
 * Layout для чекаута (клиентская часть).
 * На странице оплаты саммари переносится вниз при ≤1280px; на шаге адреса — при ≤1600px.
 */
export function CheckoutLayoutClient({ children }: CheckoutLayoutClientProps) {
  const pathname = usePathname();
  const isPaymentPage = pathname === "/checkout/payment";

  return (
    <CheckoutAddressProvider>
      <main className="pb-20">
        <Container>
          <ShopBreadcrumbs />

          {/* Основная зона: слева шаги с контентом, справа карточка; колонка при брейкпоинте */}
          <div
            className={cn(
              "mt-[60px] flex justify-between gap-10",
              isPaymentPage ? "max-[1280px]:flex-col max-[1280px]:gap-[60px]" : "max-[1600px]:flex-col max-[1600px]:gap-[60px]"
            )}
          >
            {/* Левая колонка: шаги и контент */}
            <div
              className={cn(
                "flex-1 max-w-222.5",
                isPaymentPage ? "max-[1280px]:max-w-none" : "max-[1600px]:max-w-none"
              )}
            >
              <CheckoutSteps />
              <section className="mt-9.5">
                <Suspense fallback={<CheckoutPageSkeleton />}>{children}</Suspense>
              </section>
            </div>

            {/* Правая колонка: карточка с товарами и саммари заказа */}
            <CheckoutSummaryCard />
          </div>
        </Container>
      </main>
    </CheckoutAddressProvider>
  );
}
