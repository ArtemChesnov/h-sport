"use client";

import { useProductCart, useProductQuery } from "@/shared/hooks";
import { useProductVariants } from "@/shared/hooks/product/use-product-variants";
import type { DTO } from "@/shared/services";
import { useRef, useState } from "react";
import { useProductImages } from "../lib/product-formatters";

export type UseProductPageOptions = {
  slug: string;
  initialProduct?: DTO.ProductDetailDto;
};

/**
 * Объединяет данные и состояние страницы товара: запрос, варианты, корзина, активное фото.
 */
export function useProductPage({ slug, initialProduct }: UseProductPageOptions) {
  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useProductQuery(slug, {
    initialData: initialProduct ?? undefined,
  });

  const {
    setSelectedColor,
    setSelectedSize,
    availableColors,
    availableSizes,
    effectiveColor,
    effectiveSize,
    selectedItem,
    images,
  } = useProductVariants({ product });

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const {
    currentQty,
    isInCart,
    canAddToCart,
    handleAddToCart,
    handleIncrease,
    handleDecrease,
    isLoading: isCartLoading,
  } = useProductCart(selectedItem);

  const { effectiveActiveImage } = useProductImages(images, activeImage);

  return {
    product,
    isLoading,
    isError,
    error,
    setSelectedColor,
    setSelectedSize,
    availableColors,
    availableSizes,
    effectiveColor,
    effectiveSize,
    selectedItem,
    images,
    activeImage,
    setActiveImage,
    effectiveActiveImage,
    currentQty,
    isInCart,
    canAddToCart,
    handleAddToCart,
    handleIncrease,
    handleDecrease,
    isCartLoading,
    galleryRef,
    infoRef,
    tabsRef,
  };
}
