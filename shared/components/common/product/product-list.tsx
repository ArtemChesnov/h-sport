"use client";

import { ErrorFallbackBlock, StoreEmptyBlock } from "@/shared/components/common";
import { ProductCardSkeleton } from "@/shared/components/common/skeleton/product-card-skeleton";
import { cn } from "@/shared/lib/utils";
import { DTO } from "@/shared/services";
import React from "react";
import type { ViewMode } from "../catalog/view-toggle";
import { buildBlocks } from "./build-blocks";
import { MosaicBlock } from "./mosaic-block";
import { MosaicBlockSkeleton } from "./mosaic-block-skeleton";
import { ProductCard } from "./product-card";

type ProductListProps = {
  products?: DTO.ProductListItemDto[];
  isLoading?: boolean;
  /** Фоновая загрузка данных (при наличии предыдущих данных) */
  isFetching?: boolean;
  isError?: boolean;
  className?: string;
  emptyText?: string;
  errorText?: string;
  /** Кнопка при пустом списке (стиль магазина) */
  emptyAction?: { href: string; label: string };
  /** Колбэк повтора при ошибке загрузки */
  onErrorRetry?: () => void;
  viewMode?: ViewMode;
};

export function ProductList({
  products,
  isLoading = false,
  isFetching = false,
  isError = false,
  className,
  emptyText = "Товары не найдены.",
  errorText = "Не удалось загрузить товары. Попробуй обновить страницу чуть позже.",
  emptyAction,
  onErrorRetry,
  viewMode = "mosaic",
}: ProductListProps) {
  const { safeProducts, desktopBlocks, desktopRemainder } = React.useMemo(() => {
    const safe = products ?? [];
    const desktopFullCount = Math.floor(safe.length / 3) * 3;
    const desktopFullChunk = safe.slice(0, desktopFullCount);
    const desktopRem = safe.slice(desktopFullCount);
    return {
      safeProducts: safe,
      desktopBlocks: buildBlocks(desktopFullChunk),
      desktopRemainder: desktopRem,
    };
  }, [products]);

  // Показываем скелетон только при первой загрузке (нет данных)
  // При фоновой загрузке (isFetching) показываем текущие данные с полупрозрачностью
  const showSkeleton = isLoading && safeProducts.length === 0;

  // Класс для плавного затемнения при фоновой загрузке
  const fetchingClass =
    isFetching && safeProducts.length > 0
      ? "opacity-60 pointer-events-none transition-opacity duration-200"
      : "opacity-100 transition-opacity duration-200";

  if (showSkeleton) {
    // Скелетон для grid-2 вида
    if (viewMode === "grid-2") {
      return (
        <section className={cn("w-full", className)}>
          <div className="w-full max-w-[1570px]">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 lg:gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`grid-skel-${index}`}
                  className="aspect-[3/4] min-h-[320px] sm:min-h-[380px]"
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // Скелетон для мозаичного вида (сетка как в новой верстке: ≤1280px — 2 в ряд от 410px, 1 от 410px; ≥1280px — мозаика A/B)
    return (
      <section className={cn("w-full min-w-0", className)}>
        <div className="w-full min-w-0 max-w-[1570px] space-y-2.5 lg:space-y-5">
          {/* ≤1280px: сетка 1 кол. до 410px, 2 кол. от 410px */}
          <div className="space-y-2.5 lg:space-y-5 xl:hidden min-w-0">
            <div className="grid grid-cols-1 min-[410px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[10px] lg:gap-4 min-w-0 overflow-x-hidden">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`mobile-skel-${index}`}
                  className="min-w-0 aspect-[3/4] min-h-[280px] min-[410px]:min-h-[240px] min-[640px]:min-h-[320px] sm:min-h-[380px] overflow-hidden"
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>

          {/* ≥1280px: мозаичные блоки A/B */}
          <div className="hidden space-y-2.5 lg:space-y-5 xl:block">
            {Array.from({ length: 2 }).map((_, index) => {
              const type = index % 2 === 0 ? "A" : "B";
              return <MosaicBlockSkeleton key={`desktop-skel-${index}`} type={type} />;
            })}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={cn("w-full", className)}>
        <ErrorFallbackBlock
          title="Ошибка загрузки"
          description={errorText}
          onRetry={onErrorRetry ?? (() => window.location.reload())}
          secondaryAction={{ href: "/catalog", label: "В каталог" }}
          minHeight="40vh"
        />
      </section>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <section className={cn("w-full", className)}>
        <StoreEmptyBlock title={emptyText} action={emptyAction} />
      </section>
    );
  }

  // Если выбран вид "grid-2": ≤1280px — 1 карточка в ряд во всю ширину, >1280px — 2 в ряд
  if (viewMode === "grid-2") {
    return (
      <section className={cn("w-full view-transition", fetchingClass, className)}>
        <div className="w-full max-w-[1570px]">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 lg:gap-6">
            {safeProducts.map((product, index) => (
              <div
                key={`grid-2-${product.id}`}
                className="catalog-card aspect-[3/4] min-h-[320px] sm:min-h-[380px] overflow-hidden flex"
              >
                <ProductCard
                  product={product}
                  variant="favorites"
                  imageFill
                  priority={index === 0}
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Мозаичный вид (по умолчанию)
  return (
    <section className={cn("w-full min-w-0 view-transition", fetchingClass, className)}>
      <div className="w-full min-w-0 max-w-[1570px] space-y-2.5 lg:space-y-5">
        {/* --- ≤1280px: до 410px — 1 карточка в ряд, от 410px — 2 в ряд; колонки minmax(0,1fr) чтобы не наезжали --- */}
        <div className="space-y-2.5 lg:space-y-5 xl:hidden min-w-0">
          <div className="grid grid-cols-1 min-[410px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[10px] lg:gap-4 min-w-0 overflow-x-hidden">
            {safeProducts.map((product, index) => (
              <div
                key={`mobile-${product.id}`}
                className="catalog-card min-w-0 aspect-[3/4] min-h-[280px] min-[410px]:min-h-[240px] min-[640px]:min-h-[320px] sm:min-h-[380px] overflow-hidden flex"
              >
                <ProductCard
                  product={product}
                  variant="favorites"
                  imageFill
                  className="h-full w-full"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* --- ≥ 1280px: мозаичные блоки A/B --- */}
        <div className="hidden space-y-2.5 lg:space-y-5 xl:block">
          {desktopBlocks.map((block, index) => (
            <div
              key={`desktop-${block.type}-${block.items.map((i) => i.id).join("-")}`}
              className="mosaic-block"
            >
              <MosaicBlock
                type={block.type}
                items={block.items}
                isFirstBlock={index === 0}
                cardVariant="favorites"
              />
            </div>
          ))}

          {desktopRemainder.length > 0 && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:gap-4 xl:gap-5">
              {desktopRemainder.map((product, index) => (
                <div
                  key={`remainder-${product.id}`}
                  className="catalog-card h-[360px] sm:h-[420px] lg:h-[520px] xl:h-[600px] min-h-0 overflow-hidden flex"
                >
                  <ProductCard
                    product={product}
                    variant="favorites"
                    imageFill
                    className="h-full w-full"
                    priority={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
