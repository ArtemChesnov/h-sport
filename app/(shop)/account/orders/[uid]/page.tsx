"use client";

import { OrderSummaryBlock, StoreEmptyBlock, SummaryCardLayout } from "@/shared/components/common";
import { DesignButton } from "@/shared/components/ui";
import { useOrderDetailQuery, usePayOrderMutation } from "@/shared/hooks/orders/orders.hooks";
import { cn } from "@/shared/lib/utils";
import { formatOrderCardDate } from "@/shared/lib/formatters";
import { getDeliveryMethodLabel, getOrderStatusInfo } from "@/shared/lib/styles";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { ORDER_LABEL_CLASS, ORDER_VALUE_CLASS } from "@/shared/constants";
import { TOAST } from "@/shared/constants";
import { OrderDetailItem } from "../_components/order-detail-item";
import { OrderDetailSkeleton } from "../_components/order-detail-skeleton";

/**
 * Страница деталки одного заказа в ЛК.
 *
 * Берёт uid из /account/orders/[uid] через useParams и загружает
 * данные заказа через useOrderDetailQuery.
 */
export default function AccountOrderDetailPage() {
  const params = useParams<{ uid: string }>();
  const uidParam = params?.uid;
  const uid = uidParam ? String(uidParam) : "";

  const { data, isLoading, isError } = useOrderDetailQuery(uid);
  const payOrderMutation = usePayOrderMutation();

  // Если uid пустой — странный маршрут / битая ссылка.
  if (!uid) {
    return (
      <StoreEmptyBlock
        title="Заказ не найден"
        description="Проверь ссылку на заказ."
        action={{ href: "/account/orders", label: "К заказам" }}
      />
    );
  }

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (isError || !data) {
    return (
      <StoreEmptyBlock
        title="Не удалось загрузить заказ"
        description="Попробуй обновить страницу или вернуться позже."
        action={{ href: "/account/orders", label: "К заказам" }}
      />
    );
  }

  const order = data;
  const statusInfo = getOrderStatusInfo(order.status);
  const canPay = order.status === "NEW" || order.status === "PENDING_PAYMENT";
  const fullAddress = order.delivery
    ? [order.delivery.city, order.delivery.address].filter(Boolean).join(", ") || null
    : null;

  return (
    <div className="flex flex-col max-[1919px]:gap-12 min-[1920px]:flex-row min-[1920px]:justify-between">
      <div className="flex flex-col min-w-0">
        <div className="flex flex-col gap-6 min-[1024px]:gap-10.5">
          <div className="flex flex-col gap-2">
            <h1 className="text-[22px] leading-[100%] font-semibold max-[576px]:text-[22px] min-[873px]:text-[32px] min-[1024px]:text-[38px]">
              Заказ от {formatOrderCardDate(order.createdAt)}
            </h1>
            <div className="flex items-center gap-2.5">
              <p className="text-[16px] max-[576px]:text-[14px] text-muted-foreground leading-[130%]">
                #{order.id}
              </p>
              <span
                className={[
                  "text-[14px] font-light px-2.5 py-[2.5px] leading-[130%] rounded-full border",
                  statusInfo.color,
                ].join(" ")}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4 min-[873px]:gap-6">
            <div className="flex flex-col gap-2 min-[873px]:gap-3">
              <h4 className={ORDER_LABEL_CLASS}>Получатель</h4>
              <p className={ORDER_VALUE_CLASS}>{order.fullName || "—"}</p>
            </div>
            <div className="flex flex-col gap-2 min-[873px]:gap-3">
              <h4 className={ORDER_LABEL_CLASS}>Контактные данные</h4>
              <div className="flex flex-col gap-2">
                <p className={ORDER_VALUE_CLASS}>{order.email}</p>
                <p className={ORDER_VALUE_CLASS}>{order.phone || "Не указан"}</p>
              </div>
            </div>
            {fullAddress && (
              <div className="flex flex-col gap-2 min-[873px]:gap-3">
                <h4 className={ORDER_LABEL_CLASS}>Адрес</h4>
                <p className={ORDER_VALUE_CLASS}>{fullAddress}</p>
              </div>
            )}
            {order.delivery?.method && (
              <div className="flex flex-col gap-2 min-[873px]:gap-3">
                <h4 className={ORDER_LABEL_CLASS}>Способ доставки</h4>
                <p className={ORDER_VALUE_CLASS}>{getDeliveryMethodLabel(order.delivery.method)}</p>
              </div>
            )}
            <div className="flex flex-col gap-2 min-[873px]:gap-3">
              <h4 className={ORDER_LABEL_CLASS}>Трек-номер</h4>
              <p className={ORDER_VALUE_CLASS}>
                {order.delivery?.trackingCode ?? "Появится после отправки заказа"}
              </p>
            </div>
          </div>
        </div>

        {canPay && (
          <DesignButton
            variant="outline"
            className="h-12 w-full max-[576px]:mt-6 min-[577px]:w-53.75 min-[577px]:min-w-53.75 mt-8 min-[1024px]:mt-10"
            disabled={payOrderMutation.isPending}
            onClick={() =>
              payOrderMutation.mutate(order.uid, {
                onError: (err) =>
                  toast.error(TOAST.ERROR.FAILED_TO_CREATE_PAYMENT, {
                    description: err.message,
                  }),
              })
            }
          >
            {payOrderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Оплатить"}
          </DesignButton>
        )}
      </div>
      <SummaryCardLayout
        title="Состав заказа"
        containerClassName={cn(
          "w-full min-[1920px]:w-200 min-[1920px]:shrink-0",
          "max-[872px]:[&_h3]:text-[22px] max-[872px]:[&_h3]:mb-6 max-[872px]:[&_h4]:text-[16px] max-[872px]:[&_.order-summary-total-row_h4]:text-[18px]"
        )}
        itemsList={
          <>
            {order.items.map((item, index) => (
              <div
                key={`${item.productId}-${item.sku ?? ""}-${item.color ?? ""}-${item.size ?? ""}`}
              >
                <OrderDetailItem item={item} />
                {index < order.items.length - 1 && (
                  <div className="w-full h-0.75 bg-primary my-4 max-[576px]:my-3" />
                )}
              </div>
            ))}
          </>
        }
        itemsListClassName={cn(
          order.items.length > 3 &&
            "max-h-112.5 overflow-y-auto cart-scrollbar pr-2 max-[576px]:max-h-80"
        )}
        summary={
          <div className="mt-6 min-[873px]:mt-9 bg-[#F4F0F0] h-fit w-full min-[1920px]:w-175 flex flex-col rounded-[10px]">
            <OrderSummaryBlock
              subtotal={order.subtotal}
              discount={order.discount}
              deliveryCost={order.deliveryFee}
              appliedCode={order.promoCode}
            />
          </div>
        }
      />
    </div>
  );
}
