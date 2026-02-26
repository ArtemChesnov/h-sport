"use client";

import {
    ProductCartControls,
    ProductInfoSection,
    ProductVariantSelector,
} from "@/shared/components/common/product";
import { cn } from "@/shared/lib";
import { DTO } from "@/shared/services";

interface ProductInfoProps {
  product: DTO.ProductDetailDto;
  selectedItem: DTO.ProductItemDetailDto | null;
  availableColors: string[];
  availableSizes: string[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  priceLabel: string;
  currentQty: number;
  isInCart: boolean;
  canAddToCart: boolean;
  onAddToCart: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  isCartLoading: boolean;
  className?: string;
}

/**
 * Компонент с информацией о товаре и контролами корзины
 */
export function ProductInfo({
  product,
  selectedItem,
  availableColors,
  availableSizes,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
  priceLabel,
  currentQty,
  isInCart,
  canAddToCart,
  onAddToCart,
  onIncrease,
  onDecrease,
  isCartLoading,
  className,
}: ProductInfoProps) {
  if (!selectedItem) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Название и цена */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold leading-tight">{product.name}</h1>
        <div className="text-2xl font-semibold text-primary">{priceLabel}</div>
      </div>

      {/* Описание */}
      {product.description && (
        <ProductInfoSection title="Описание">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </ProductInfoSection>
      )}

      {/* Варианты цвета */}
      <ProductVariantSelector
        title="Цвет"
        options={availableColors}
        value={selectedColor}
        onChange={onColorSelect}
      />

      {/* Варианты размера */}
      <ProductVariantSelector
        title="Размер"
        options={availableSizes}
        value={selectedSize}
        onChange={onSizeSelect}
      />

      {/* Контролы корзины */}
      <ProductCartControls
        isInCart={isInCart}
        currentQty={currentQty}
        canAddToCart={canAddToCart}
        isCartLoading={isCartLoading}
        onAddToCart={onAddToCart}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
      />

      {/* Дополнительная информация */}
      <div className="space-y-2 text-xs text-muted-foreground">
        {!selectedItem.isAvailable && (
          <div className="text-orange-600 font-medium">Временно отсутствует</div>
        )}
      </div>
    </div>
  );
}
