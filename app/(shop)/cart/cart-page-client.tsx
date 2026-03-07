"use client";

import { Container, ShopBreadcrumbs, StoreEmptyBlock } from "@/shared/components/common";
import { CART_LABELS, CTA } from "@/shared/constants";
import { useCartQuery, useIsHydrated } from "@/shared/hooks";
import { ShoppingCart } from "lucide-react";

import { CartItemList } from "./_components/cart-item-list";
import { CartPageSkeleton } from "./_components/cart-page-skeleton";
import { CartSummaryCard } from "./_components/cart-summary-card";

export default function CartPageClient() {
  const isHydrated = useIsHydrated();
  const { data: cart, isLoading } = useCartQuery();

  const showSkeleton = !isHydrated || isLoading;
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const discount = cart?.discount ?? 0;
  const appliedCode = cart?.promoCode ?? null;

  return (
    <main>
      {/* отступ под абсолютный хедер */}
      <Container className="space-y-10">
        {/* Хлебные крошки */}
        <ShopBreadcrumbs />

        <div className="mt-15">
          {showSkeleton ? (
            <CartPageSkeleton omitHeader />
          ) : items.length === 0 ? (
            <div className="mt-15">
              <StoreEmptyBlock
                title={CART_LABELS.emptyTitle}
                description="Добавь товары в корзину и вернись сюда, чтобы оформить заказ."
                icon={ShoppingCart}
                action={{ href: "/catalog", label: CTA.GO_TO_CATALOG }}
                className="min-h-[50vh]"
              />
            </div>
          ) : (
            <>
              <h1 className="text-[40px] max-[768px]:text-[28px] mt-15 font-medium">
                {CART_LABELS.title}
              </h1>
              <section className="flex flex-col min-[1081px]:flex-row justify-between mt-10 gap-10">
                {/* Левая колонка — товары */}
                <CartItemList items={items} />

                <div
                  data-cart-summary
                  className="w-full min-[1081px]:min-w-114 min-[1081px]:max-w-175 min-[1081px]:flex-1 min-[1081px]:basis-0 max-[768px]:[&_h3]:text-[22px] max-[768px]:[&_h3]:mb-6 max-[768px]:[&_h4]:text-[16px] max-[768px]:[&_.order-summary-total-row_h4]:text-[18px]"
                >
                  <CartSummaryCard
                    subtotal={subtotal}
                    discount={discount}
                    appliedCode={appliedCode}
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
