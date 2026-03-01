"use client";

import { FavoriteToggleButton } from "@/shared/components/common";
import { cn } from "@/shared/lib/utils";
import { DTO } from "@/shared/services";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ProductCardTextBlock } from "./product-card-text-block";

type ProductCardProps = {
  product: DTO.ProductListItemDto;
  className?: string;
  priority?: boolean;
  /** Вариант "favorites": текст под картинкой, без анимации */
  variant?: "default" | "favorites";
  /** Переопределение sizes для Image (каталог, бестселлеры) */
  imageSizes?: string;
  /** Колбэк при переключении избранного (для скрытия карточки на странице избранного) */
  onToggleFavorite?: (productId: number, nextIsFavorite: boolean) => void;
  /** Заполнять контейнер (для мозаики): image flex-1 вместо aspect-3/4 */
  imageFill?: boolean;
};

function ProductCardComponent({
  product,
  className,
  priority = false,
  variant = "default",
  imageSizes,
  onToggleFavorite,
  imageFill = false,
}: ProductCardProps) {
  const { slug, name, id, price, previewImage } = product;

  const href = `/product/${slug}`;

  const textBlock = <ProductCardTextBlock name={name} price={price} />;

  if (variant === "favorites") {
    const imageContainerClass = imageFill
      ? "relative flex-1 min-h-0 w-full overflow-hidden"
      : "relative aspect-3/4 w-full overflow-hidden";
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        prefetch={false}
        className={cn(
          "block cursor-pointer group",
          imageFill && "h-full w-full min-h-0",
          className
        )}
      >
        <div className={cn("relative bg-neutral-100", imageFill && "flex flex-col h-full min-h-0")}>
          <div className={imageContainerClass}>
            <Image
              src={previewImage || "/assets/images/sport-types/fitness.webp"}
              alt={name}
              fill
              sizes={imageSizes ?? "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
            />
            <FavoriteToggleButton
              className="absolute right-4 top-4"
              size="sm"
              productId={id}
              onToggle={onToggleFavorite}
            />
          </div>
          <div className={cn(imageFill && "shrink-0")}>{textBlock}</div>
        </div>
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-neutral-100 group cursor-pointer h-full w-full",
        className
      )}
    >
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        prefetch={false}
        className="flex h-full flex-col"
      >
        <div className="relative h-full w-full">
          <Image
            src={previewImage || "/assets/images/sport-types/fitness.webp"}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />

          <FavoriteToggleButton className="absolute right-5 top-5" productId={id} />
        </div>
        <ProductCardTextBlock name={name} price={price} className={className} />
      </Link>
    </div>
  );
}

// Мемоизация для предотвращения ненужных ре-рендеров
export const ProductCard = React.memo(ProductCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.previewImage === nextProps.product.previewImage &&
    prevProps.className === nextProps.className &&
    prevProps.priority === nextProps.priority &&
    prevProps.variant === nextProps.variant &&
    prevProps.imageSizes === nextProps.imageSizes &&
    prevProps.onToggleFavorite === nextProps.onToggleFavorite &&
    prevProps.imageFill === nextProps.imageFill
  );
});
