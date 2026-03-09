import { StoreEmptyBlock } from "@/shared/components/common";
import { CTA } from "@/shared/constants";
import { ShopLayout } from "@/shared/components/layouts/ShopLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

/**
 * Глобальная 404: показывается при прямом заходе на несуществующий URL
 * (например /favorit). (shop)/not-found.tsx используется при вызове notFound() из страниц магазина.
 */
export default function GlobalNotFoundPage() {
  return (
    <ShopLayout>
      <div className="flex flex-col items-center justify-center mt-40 min-h-[50vh]">
        <StoreEmptyBlock
          title="Страница не найдена"
          description="Проверьте корректность введённого адреса или повторите попытку позже"
          action={{ href: "/catalog", label: CTA.GO_TO_CATALOG }}
        />
      </div>
    </ShopLayout>
  );
}
