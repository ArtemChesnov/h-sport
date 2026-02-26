"use client";

import { cn } from "@/shared/lib";

interface ProductSizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
  className?: string;
}

/**
 * Селектор размера товара
 */
export function ProductSizeSelector({
  sizes,
  selectedSize,
  onSizeSelect,
  className,
}: ProductSizeSelectorProps) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className={cn("flex flex-col", className)}>
      <p className="text-[20px] leading-[120%]">Размер</p>
      <div className="w-full h-[3px] bg-primary my-4" />
      <div className="flex gap-3.5">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => onSizeSelect(size)}
              className={cn(
                "rounded-[10px] cursor-pointer flex items-center justify-center text-[20px] leading-[100%] h-[34px] min-w-[40px] px-2 transition-all duration-200",
                isSelected
                  ? "border border-foreground text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
              aria-label={`Выбрать размер ${size}`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
