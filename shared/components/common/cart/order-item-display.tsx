"use client";

import { Button } from "@/shared/components/ui";
import { getColorHex } from "@/shared/constants";
import { useCartItemActions } from "@/shared/hooks/cart/use-cart-item-actions";
import { cn, formatMoney } from "@/shared/lib";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/shared/lib/constants/images";
import type { DTO } from "@/shared/services";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

function isCartItem(item: DTO.CartItemDto | DTO.OrderItemDto): item is DTO.CartItemDto {
  return "product" in item && "id" in item;
}

export type OrderItemDisplayActions = {
  handleDecrease: () => void;
  handleIncrease: () => void;
  handleDelete: () => void;
  isBusy: boolean;
};

export type OrderItemDisplayProps = {
  item: DTO.CartItemDto | DTO.OrderItemDto;
  /** Передавать только для режима корзины (интерактив) */
  actions?: OrderItemDisplayActions;
  /** Классы для обёртки фото (ширина/высота). Пример: "w-[200px] h-[200px] min-[1441px]:w-[240px] min-[1441px]:h-[240px]" */
  imageClassName?: string;
  /** Атрибут sizes для next/image, например "(max-width: 1440px) 200px, 240px" */
  imageSizes?: string;
  /** Дизейблить кнопки +/- и удаления (видны, но не кликабельны) */
  disabled?: boolean;
  className?: string;
};

/**
 * Универсальный компонент отображения позиции заказа/корзины.
 * С actions — интерактивен (+/-, удаление). Без actions — только отображение.
 */
export function OrderItemDisplay({
  item,
  actions,
  imageClassName,
  imageSizes,
  disabled = false,
  className,
}: OrderItemDisplayProps) {
  const productName = isCartItem(item) ? item.product.productName : item.productName;
  const color = item.color ?? "";
  const size = isCartItem(item) ? String(item.size) : (item.size ?? "");
  const imageUrl = isCartItem(item)
    ? (item.product?.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE)
    : (item.productImageUrl ?? PLACEHOLDER_PRODUCT_IMAGE);

  const priceFormatted = formatMoney(item.price);
  const totalFormatted = formatMoney(item.total);
  const colorHex = getColorHex(color);
  const isBusy = actions?.isBusy ?? false;
  const isDisabled = disabled || isBusy;

  return (
    <div
      className={cn(
        "relative flex w-full h-fit flex-col max-w-[460pc]:gap-4 min-[461px]:flex-row items-center max-w-[1440px]:items-start rounded-[10px] transition-shadow duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] min-w-0",
        className
      )}
    >
      {isBusy && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-[10px] flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      <div
        className={cn(
          "relative rounded-[10px] overflow-hidden shrink-0",
          imageClassName,
          "max-[460px]:w-full! max-[460px]:aspect-square! max-[460px]:h-80!"
        )}
      >
        <Image fill alt={productName} src={imageUrl} className="object-cover" sizes={imageSizes} />
      </div>

      <div className="flex justify-between w-full px-5 max-[460px]:pt-3">
        <div className="flex flex-col gap-3">
          <h4 className="text-[20px] max-[1024px]:text-[18px] max-[576px]:text-[16px] font-medium leading-tight">
            {productName}
          </h4>
          <div className="flex flex-col gap-2">
            {color && (
              <div className="flex gap-2.5 items-center">
                <p className="text-[16px] max-[1024px]:text-[14px] max-[576px]:text-[13px]">Цвет:</p>
                <div className="flex items-center gap-2 text-left">
                  <div
                    className="w-4 h-4 rounded-full transition-all duration-150 shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="font-light text-text-secondary text-[16px] max-[1024px]:text-[14px] max-[576px]:text-[13px]">
                    {color}
                  </span>
                </div>
              </div>
            )}
            {size && (
              <div className="flex items-center gap-2.5">
                <p className="text-[16px] max-[1024px]:text-[14px] max-[576px]:text-[13px]">Размер:</p>
                <span className="px-2 py-1 bg-[#FFFFFF] rounded-[10px] text-text-secondary text-[16px] max-[1024px]:text-[14px] max-[576px]:text-[13px]">
                  {size}
                </span>
              </div>
            )}
          </div>

          {actions && (
            <div className="mt-3 min-[769px]:mt-6 min-[1441px]:mt-9.5 border border-primary rounded-[10px] w-fit flex items-center gap-1.75 px-1.25 h-9">
              <Button
                variant="ghost"
                disabled={isDisabled}
                onClick={actions.handleDecrease}
                className="w-7 text-[20px] max-[576px]:text-[18px] font-regular px-2 py-1.25 h-7.5 cursor-pointer disabled:opacity-50 transition-transform hover:scale-110 active:scale-95"
              >
                -
              </Button>
              <span className="text-[20px] max-[576px]:text-[18px] font-regular px-2 py-1.25 min-w-[2ch] text-center">
                {item.qty}
              </span>
              <Button
                variant="ghost"
                disabled={isDisabled}
                onClick={actions.handleIncrease}
                className="text-[20px] max-[576px]:text-[18px] font-regular px-2 py-1.25 h-7.5 cursor-pointer disabled:opacity-50 transition-transform hover:scale-110 active:scale-95"
              >
                +
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between items-end">
          <div className="flex flex-col gap-2 items-end">
            <h4 className="text-[20px] max-[1024px]:text-[18px] max-[576px]:text-[16px] font-medium">
              {totalFormatted}
            </h4>
            <span className="text-[16px] max-[1024px]:text-[14px] max-[576px]:text-[13px] text-text-secondary">
              {item.qty > 1 ? `${priceFormatted} × ${item.qty}` : `× ${item.qty}`}
            </span>
          </div>

          {actions && (
            <Button
              variant="ghost"
              onClick={actions.handleDelete}
              disabled={isDisabled}
              className="text-text-secondary w-9 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-[10px] cursor-pointer"
              aria-label="Удалить товар"
            >
              <Trash2 className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Обёртка для корзины: добавляет useCartItemActions и передаёт в OrderItemDisplay.
 */
export function CartItemDisplay({
  item,
  imageClassName,
  imageSizes,
  disabled = false,
  className,
}: {
  item: DTO.CartItemDto;
  imageClassName?: string;
  imageSizes?: string;
  disabled?: boolean;
  className?: string;
}) {
  const actions = useCartItemActions(item);
  return (
    <OrderItemDisplay
      item={item}
      actions={actions}
      imageClassName={imageClassName}
      imageSizes={imageSizes}
      disabled={disabled}
      className={className}
    />
  );
}
