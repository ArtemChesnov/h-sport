"use client";

import { AccountSidebar, Container, ShopBreadcrumbs } from "@/shared/components/common";

/**
 * Оболочка ЛК: сайдбар + контент.
 * Используется в account/layout.tsx.
 * Сайдбар остаётся смонтированным при переходах между вкладками.
 *
 * Референс верстки: «Моя учетная запись» (account page).
 */
export function AccountLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <main className="">
      <Container className="space-y-6 max-[576px]:space-y-6 min-[873px]:space-y-8 min-[1024px]:space-y-10">
        <ShopBreadcrumbs />

        <div className="mt-8 flex max-[872px]:flex-col max-[872px]:mt-6 max-[872px]:gap-8 max-[1600px]:gap-20 gap-63.75 min-[873px]:mt-12 min-[1024px]:mt-15">
          <AccountSidebar />

          <div className="flex flex-col gap-4 w-full pt-6 max-[872px]:pt-0 min-[873px]:gap-5 min-[873px]:pt-12 min-[1024px]:pt-24.5">
            {children}
          </div>
        </div>
      </Container>
    </main>
  );
}
