"use client";

import Image from "next/image";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@/shared/components/ui";
import { Package } from "lucide-react";
import { DTO } from "@/shared/services";
import { formatMoney } from "@/shared/lib";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/shared/lib/constants/images";

type OrderItemsCardProps = {
  order: DTO.OrderDetailDto;
};

/**
 * Карточка с позициями заказа
 */
export function OrderItemsCard({ order }: OrderItemsCardProps) {
  const subtotal = order.subtotal ?? order.total;
  const discount = order.discount ?? 0;
  const deliveryFee = order.deliveryFee ?? 0;
  const hasDiscount = discount > 0;
  const promoCode = order.promoCode ?? null;

  return (
    <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-white via-white to-emerald-50/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Package className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-base font-semibold">Состав заказа</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Позиции зафиксированы на момент оформления
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4">
            {order.items.map((item) => {
              const imageUrl = item.productImageUrl || PLACEHOLDER_PRODUCT_IMAGE;

              return (
                <div
                  key={`${item.productId}-${item.sku}-${item.size}`}
                  className="flex items-start gap-4 rounded-lg border border-border/40 bg-gradient-to-br from-white to-muted/10 p-4 transition-all hover:shadow-md hover:border-emerald-200/50"
                >
                  {/* Изображение товара */}
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Информация о товаре */}
                  <div className="flex flex-1 flex-col gap-2 min-w-0">
                    <div className="font-medium text-sm text-foreground">{item.productName}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {item.color && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Цвет:</span>
                          <span>{item.color}</span>
                        </span>
                      )}
                      {item.size && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Размер:</span>
                          <span>{item.size}</span>
                        </span>
                      )}
                      {item.sku && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Артикул:</span>
                          <span className="font-mono text-[11px]">{item.sku}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Количество: <span className="font-medium">{item.qty}</span> × <span className="font-medium">{formatMoney(item.price)}</span>
                    </div>
                  </div>

                  {/* Цена */}
                  <div className="flex flex-col items-end justify-start gap-1 text-right">
                    <div className="font-semibold text-base">{formatMoney(item.total)}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.qty} × {formatMoney(item.price)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Итоговая информация */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Стоимость товаров:</span>
              <span className="font-medium">{formatMoney(subtotal)}</span>
            </div>

            {hasDiscount && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span>Скидка по промокоду:</span>
                  {promoCode && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-rose-300 text-rose-700 bg-rose-50">
                      {promoCode}
                    </Badge>
                  )}
                </span>
                <span className="font-medium text-rose-600">-{formatMoney(discount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Стоимость доставки:</span>
              <span className="font-medium">{formatMoney(deliveryFee)}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between text-base font-semibold">
              <span>Итого:</span>
              <span className="text-lg">{formatMoney(order.total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
