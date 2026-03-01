"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/utils";
interface ProductGalleryProps {
  images: string[];
  activeImage: string | null;
  onImageSelect: (image: string) => void;
  className?: string;
}

/**
 * Компонент галереи изображений товара
 * Поддерживает главное изображение и миниатюры
 */
export function ProductGallery({
  images,
  activeImage,
  onImageSelect,
  className,
}: ProductGalleryProps) {
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  const handleImageLoad = (src: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [src]: false }));
  };

  const handleImageLoadStart = (src: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [src]: true }));
  };

  const handleThumbClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const image = e.currentTarget.dataset.image;
      if (image) onImageSelect(image);
    },
    [onImageSelect]
  );

  if (!images || images.length === 0) {
    return (
      <div
        className={cn(
          "relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-muted/40",
          className
        )}
      >
        <div className="flex h-full items-center justify-center">
          <span className="text-muted-foreground">Изображение недоступно</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Главное изображение */}
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-muted/40">
        <Image
          src={activeImage || images[0]}
          alt="Товар"
          fill
          className={cn(
            "object-contain transition-opacity duration-300",
            imageLoadingStates[activeImage || images[0]] && "opacity-0"
          )}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => handleImageLoad(activeImage || images[0])}
          onLoadStart={() => handleImageLoadStart(activeImage || images[0])}
        />

        {/* Заглушка загрузки */}
        {imageLoadingStates[activeImage || images[0]] && (
          <div className="absolute inset-0 animate-pulse bg-muted/40" />
        )}
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              data-image={image}
              onClick={handleThumbClick}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200",
                activeImage === image || (!activeImage && index === 0)
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-muted hover:border-muted-foreground/50"
              )}
              aria-label={`Выбрать изображение ${index + 1}`}
            >
              <Image
                src={image}
                alt={`Миниатюра ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
