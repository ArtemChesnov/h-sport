"use client";

import {
  Container,
  FavoriteToggleButton,
  ShopBreadcrumbs,
  StoreEmptyBlock,
  YouMightLikeBlock,
} from "@/shared/components/common";
import { ProductErrorBoundary } from "@/shared/components/error-boundaries";
import { CTA } from "@/shared/constants";
import { env } from "@/shared/lib/env.client";
import { formatMoney } from "@/shared/lib/formatters";
import { createProductJsonLd, JsonLd } from "@/shared/lib/seo/json-ld";
import type { DTO } from "@/shared/services";
import { useMemo } from "react";
import { ProductGalleryNew } from "./gallery/product-gallery-new";
import { useProductPage } from "./hooks/use-product-page";
import { useProductPageReveal } from "./hooks/use-product-page-reveal";
import { ProductCartControlsNew } from "./product-cart-controls-new";
import { ProductColorSelector } from "./product-color-selector";
import { ProductSizeSelector } from "./product-size-selector";
import { ProductSkeleton } from "./product-skeleton";
import { ProductTabs } from "./product-tabs";

type ProductSlugClientProps = {
  slug: string;
  initialProduct?: DTO.ProductDetailDto;
  /** Данные блока «Вам понравится» с сервера — без дополнительного запроса с клиента */
  youMightLikeProducts?: DTO.ProductListItemDto[];
};

export function ProductSlugClient({
  slug,
  initialProduct,
  youMightLikeProducts,
}: ProductSlugClientProps) {
  const {
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
  } = useProductPage({ slug, initialProduct });

  useProductPageReveal(galleryRef, infoRef, tabsRef, product?.id);

  const jsonLdData = useMemo(() => {
    if (!product || !selectedItem) return null;

    const baseUrl = env.appUrl;
    const productUrl = `${baseUrl}/product/${product.slug}`;
    const toAbsoluteUrl = (src: string) =>
      src.startsWith("http") ? src : `${baseUrl}${src.startsWith("/") ? "" : "/"}${src}`;
    const productImages = images.length > 0 ? images.map(toAbsoluteUrl) : undefined;

    return createProductJsonLd({
      name: product.name,
      description: product.description || undefined,
      image: productImages,
      sku: selectedItem.sku || undefined,
      price: selectedItem.price,
      currency: "RUB",
      availability: selectedItem.isAvailable,
      url: productUrl,
      brand: "H-Sport",
      category: product.categoryName,
    });
  }, [product, selectedItem, images]);

  // --- Состояния загрузки / ошибки -----------------------------------------

  if (isLoading) {
    return <ProductSkeleton />;
  }

  if (isError || !product) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Не удалось загрузить товар. Попробуй обновить страницу.";

    return (
      <div className="pb-20">
        <Container>
          <ShopBreadcrumbs />
          <StoreEmptyBlock
            title="Товар не найден"
            description={errorMessage}
            action={{ href: "/catalog", label: CTA.GO_TO_CATALOG }}
            className="mt-[60px] min-h-[50vh]"
          />
        </Container>
      </div>
    );
  }

  const priceLabel = selectedItem ? formatMoney(selectedItem.price) : formatMoney(product.price);

  return (
    <ProductErrorBoundary>
      {jsonLdData && <JsonLd data={jsonLdData} />}
      <Container>
        {/* Хлебные крошки без px */}
        <ShopBreadcrumbs customLastLabel={product.name} />
        <div className="">
          <div className="mt-15 flex w-full flex-col min-[1200px]:flex-row lg:justify-between gap-10">
            {/* Галерея — растёт до 1190px (880+290+20); при 1920+ фиксировано 1190px */}
            <div
              ref={galleryRef}
              className="w-full lg:min-w-[710px] lg:max-w-[1190px] min-[1920px]:min-w-[1190px] min-[1920px]:max-w-[1190px] min-[1920px]:flex-none min-[1920px]:w-[1190px] lg:flex-1 lg:shrink-0 motion-reduce:opacity-100"
            >
              <ProductGalleryNew
                images={images}
                activeImage={effectiveActiveImage}
                onImageSelect={setActiveImage}
              />
            </div>

            {/* Информация о товаре — занимает оставшееся пространство, max 640px; при 1920+ адаптируется по ширине */}
            <div
              ref={infoRef}
              className="flex flex-col gap-[52px] w-full lg:max-w-[605px] lg:min-w-[320px] min-[1920px]:min-w-0 min-[1920px]:flex-1 min-[1920px]:max-w-none motion-reduce:opacity-100"
            >
              {/* Название и цена */}
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center gap-4">
                  <h1 className="font-normal text-[52px] leading-[110%] flex-1">{product.name}</h1>
                  <FavoriteToggleButton
                    productId={product.id}
                    size="md"
                    className="shrink-0 mt-2"
                  />
                </div>
                <p className="text-[32px] leading-[130%]">{priceLabel}</p>
              </div>

              {/* Варианты */}
              <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-6">
                  {/* Цвет */}
                  {availableColors.length > 0 && (
                    <ProductColorSelector
                      colors={availableColors}
                      selectedColor={effectiveColor}
                      onColorSelect={setSelectedColor}
                    />
                  )}

                  {/* Размер */}
                  {availableSizes.length > 0 && (
                    <ProductSizeSelector
                      sizes={availableSizes}
                      selectedSize={effectiveSize}
                      onSizeSelect={setSelectedSize}
                    />
                  )}
                </div>

                {/* Контролы корзины */}
                <ProductCartControlsNew
                  isInCart={isInCart}
                  currentQty={currentQty}
                  canAddToCart={canAddToCart}
                  isCartLoading={isCartLoading}
                  onAddToCart={handleAddToCart}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                />
              </div>

              {/* Табы: Описание, Доставка, Возврат */}
              <div ref={tabsRef} className="motion-reduce:opacity-100">
                <ProductTabs description={product.description} composition={product.composition} />
              </div>

              {/* Статус доступности */}
              {selectedItem && !selectedItem.isAvailable && (
                <div className="text-gray-500 font-medium text-[16px]">Нет в наличии</div>
              )}
            </div>
          </div>

          {/* Вам понравится — данные с сервера, без отдельного запроса */}
          <YouMightLikeBlock excludeProductId={product.id} initialProducts={youMightLikeProducts} />
        </div>
      </Container>
    </ProductErrorBoundary>
  );
}
