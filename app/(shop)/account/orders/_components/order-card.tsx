"use client";

import { DesignButton } from "@/shared/components/ui";
import { ORDER_LABEL_CLASS, ORDER_VALUE_CLASS } from "@/shared/constants";
import { TOAST } from "@/shared/constants";
import { usePayOrderMutation } from "@/shared/hooks";
import { formatMoney, formatOrderCardDate, formatOrderCardDateOnly } from "@/shared/lib/formatters";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/shared/lib/constants/images";
import { getDeliveryMethodLabel, getOrderStatusInfo } from "@/shared/lib/styles";
import { DTO } from "@/shared/services";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

const UNPAID_STATUSES = ["NEW", "PENDING_PAYMENT"] as const;

function canPayOrder(status: string): boolean {
  return UNPAID_STATUSES.includes(status as (typeof UNPAID_STATUSES)[number]);
}

interface OrderCardProps {
  order: DTO.OrderShortDto;
}

export function OrderCard({ order }: OrderCardProps) {
  const payOrderMutation = usePayOrderMutation();
  const statusInfo = getOrderStatusInfo(order.status);
  const showPayButton = canPayOrder(order.status);

  return (
    <div className="block overflow-visible rounded-lg border border-neutral-100 bg-white transition-shadow duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-4 p-4 max-[576px]:p-4 min-[873px]:gap-6 min-[873px]:p-6 min-[1024px]:p-10 rounded-[10px] w-full h-fit">
        {/* Сумма заказа всегда в правом верхнем углу */}
        <div className="flex flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <h3 className="text-[18px] font-medium max-[872px]:text-[18px] min-[873px]:text-[20px]">
              <span className="max-[576px]:hidden">
                Заказ от {formatOrderCardDate(order.createdAt)}
              </span>
              <span className="min-[577px]:hidden">
                Заказ от {formatOrderCardDateOnly(order.createdAt)}
              </span>
            </h3>
            <div className="flex items-center gap-2.5">
              <p className={`${ORDER_VALUE_CLASS} text-muted-foreground`}>#{order.id}</p>
              <span
                className={[
                  "text-[12px] font-light px-2.5 py-[2.5px] leading-[130%] rounded-full border",
                  statusInfo.color,
                ].join(" ")}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>
          <h3 className="text-[18px] font-medium min-[873px]:text-[20px] shrink-0">
            {formatMoney(order.total)}
          </h3>
        </div>
        {/* ≤872px: адрес → фото → кнопки внизу (кнопки на всю ширину, равные). ≥873px: [адрес+кнопки] | фото */}
        <div className="grid grid-cols-1 gap-4 min-[873px]:grid-cols-2 min-[873px]:flex-row min-[873px]:justify-between min-[873px]:gap-6">
          <div className="flex flex-col gap-3 max-[576px]:gap-3 min-[873px]:gap-3.5 min-[873px]:row-start-1 min-[873px]:col-start-1">
            {order.deliveryAddress && (
              <div className="flex flex-col gap-2">
                <h4 className={ORDER_LABEL_CLASS}>Полный адрес</h4>
                <p className={ORDER_VALUE_CLASS}>{order.deliveryAddress}</p>
              </div>
            )}
            {order.deliveryMethod && (
              <div className="flex flex-col gap-2">
                <h4 className={ORDER_LABEL_CLASS}>Способ доставки</h4>
                <p className={ORDER_VALUE_CLASS}>{getDeliveryMethodLabel(order.deliveryMethod)}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <h4 className={ORDER_LABEL_CLASS}>Трек-номер</h4>
              <p className={ORDER_VALUE_CLASS}>
                {order.trackingCode ?? "Появится после отправки заказа"}
              </p>
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-center max-[872px]:justify-start justify-end gap-4 min-[873px]:flex-col min-[873px]:items-end max-[872px]:row-start-2 min-[873px]:col-start-2 min-[873px]:row-start-1 min-[873px]:row-span-2 min-w-0 overflow-hidden pt-5 pr-5">
            <div className="flex gap-3 max-[576px]:gap-2 min-[873px]:gap-5 min-[873px]:max-[1440px]:[&>*:not(:first-child)]:hidden min-w-0">
              {/* При 872px и ниже: фото прижаты к левому краю; ≤576px: w-20 h-20, 577–872px: w-40 h-40. При 873–1440px: одно фото + бейдж. Выше 1440px: три фото. 873–1840px: 140×140, ≥1841px: 180×180. */}
              {(order.itemImageUrls?.length ? order.itemImageUrls : [null, null, null])
                .slice(0, 3)
                .map((url, i) => (
                  <div
                    key={i}
                    className="relative max-[872px]:w-40 max-[872px]:h-40 max-[576px]:w-20 max-[576px]:h-20 min-[873px]:w-[140px] min-[873px]:h-[140px] min-[1841px]:w-[180px] min-[1841px]:h-[180px] rounded-[10px] bg-neutral-100 shrink-0"
                  >
                    <div className="absolute inset-0 overflow-hidden rounded-[10px]">
                      <Image
                        src={url ?? PLACEHOLDER_PRODUCT_IMAGE}
                        alt=""
                        width={240}
                        height={240}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {i === 0 && order.itemsCount > 1 && (
                      <span
                        aria-label={`В заказе ${order.itemsCount} товаров`}
                        className="absolute top-0 right-0 z-10 flex aspect-square min-w-6 min-h-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-[#EB6081] p-2 text-xs font-medium leading-none text-white ring-2 ring-white shadow-sm max-[872px]:hidden min-[1441px]:hidden"
                      >
                        +{order.itemsCount}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full max-[872px]:row-start-3 min-[873px]:row-start-2 min-[873px]:col-start-1 mt-4 max-[576px]:mt-4 min-[873px]:mt-6 min-[1024px]:mt-18.5 max-[872px]:grid max-[872px]:grid-cols-2 max-[872px]:gap-3 max-[576px]:grid-cols-1 max-[576px]:[&>*]:w-full min-[873px]:flex">
            <Link
              href={`/account/orders/${order.uid}`}
              className="min-[873px]:inline-block min-w-0"
            >
              <DesignButton variant="default" className="w-full min-[873px]:w-[215px]">
                Смотреть заказ
              </DesignButton>
            </Link>
            {showPayButton && (
              <DesignButton
                variant="outline"
                className="w-full min-[873px]:w-[215px] min-[873px]:min-w-[215px] min-w-0"
                disabled={payOrderMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  payOrderMutation.mutate(order.uid, {
                    onError: (err) =>
                      toast.error(TOAST.ERROR.FAILED_TO_CREATE_PAYMENT, {
                        description: err.message,
                      }),
                  });
                }}
              >
                {payOrderMutation.isPending && payOrderMutation.variables === order.uid ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Оплатить"
                )}
              </DesignButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
