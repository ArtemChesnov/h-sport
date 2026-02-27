"use client";

import { SUMMARY_LABELS, SUMMARY_LABEL_CLASS, SUMMARY_VALUE_CLASS } from "@/shared/constants";
import { formatMoney } from "@/shared/lib/formatters";
import { formatDiscountDisplay } from "@/shared/lib/promo/format-discount-display";
import React from "react";

export type OrderSummaryBlockProps = {
  /** Стоимость товаров (копейки) */
  subtotal: number;
  /** Скидка по промокоду (копейки) */
  discount: number;
  /** Применённый промокод (если есть) */
  appliedCode?: string | null;
  /** Стоимость доставки. undefined = "при оформлении" */
  deliveryCost?: number;
  /** Срок доставки (мин. дней) */
  deliveryPeriodMin?: number | null;
  /** Срок доставки (макс. дней) */
  deliveryPeriodMax?: number | null;
  /** Слот для инпута промокода (CartSummaryPromoInput) */
  promoInput?: React.ReactNode;
  /** Слот для кнопок действий (Оформить заказ, Продолжить покупки) */
  actions?: React.ReactNode;
  /** Дополнительные классы для контейнера */
  className?: string;
};

/**
 * Универсальный блок итогов заказа (Товары, Доставка, Промокод, Итого).
 * Используется в CartSummaryCard, CheckoutSummaryCard, странице заказа в ЛК.
 */
function formatDeliveryPeriod(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null;
  const lo = min ?? 0;
  const hi = max ?? lo;
  if (lo === 0 && hi === 0) return null;
  if (lo === hi) return `${lo} дн.`;
  return `${lo}–${hi} дн.`;
}

export function OrderSummaryBlock({
  subtotal,
  discount,
  appliedCode,
  deliveryCost,
  deliveryPeriodMin,
  deliveryPeriodMax,
  promoInput,
  actions,
  className,
}: OrderSummaryBlockProps) {
  const itemsTotal = subtotal - discount;
  const isDeliveryKnown = deliveryCost !== undefined;
  const grandTotal = itemsTotal + (deliveryCost ?? 0);

  const discountDisplay = React.useMemo(
    () => formatDiscountDisplay(subtotal, discount, appliedCode ?? null),
    [subtotal, discount, appliedCode]
  );

  return (
    <div className={className}>
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between">
              <h4 className={SUMMARY_LABEL_CLASS}>{SUMMARY_LABELS.items}</h4>
              <h4 className={SUMMARY_VALUE_CLASS}>{formatMoney(subtotal)}</h4>
            </div>

            <div className="flex justify-between">
              <h4 className={SUMMARY_LABEL_CLASS}>{SUMMARY_LABELS.delivery}</h4>
              <div className="flex flex-col items-end">
                <h4 className={SUMMARY_LABEL_CLASS}>
                  {isDeliveryKnown && deliveryCost !== undefined
                    ? deliveryCost === 0
                      ? "Бесплатно"
                      : formatMoney(deliveryCost)
                    : "при оформлении"}
                </h4>
                {isDeliveryKnown &&
                  deliveryCost !== undefined &&
                  deliveryCost > 0 &&
                  (() => {
                    const period = formatDeliveryPeriod(deliveryPeriodMin, deliveryPeriodMax);
                    return period ? (
                      <span className="text-[14px] text-muted-foreground mt-0.5">{period}</span>
                    ) : null;
                  })()}
              </div>
            </div>

            {promoInput}

            <div className="flex justify-between">
              <h4 className={SUMMARY_LABEL_CLASS}>{SUMMARY_LABELS.promo}</h4>
              <h4 className={SUMMARY_LABEL_CLASS}>{discountDisplay}</h4>
            </div>
          </div>

          <div className="w-full h-0.75 bg-[#EB6081]" />

          <div className="order-summary-total-row flex justify-between">
            <h4 className="text-[24px] max-[1024px]:text-[20px] max-[576px]:text-[18px] uppercase font-medium text-foreground">
              {SUMMARY_LABELS.total}
            </h4>
            <h4 className="text-[24px] max-[1024px]:text-[20px] max-[576px]:text-[18px] font-medium text-foreground">
              {formatMoney(grandTotal)}
            </h4>
          </div>
        </div>
      </div>

      {actions}
    </div>
  );
}
