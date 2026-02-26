"use client";

import { ProductCard } from "@/shared/components/common/product/product-card";
import { YouMightLikeSkeletonContent } from "@/shared/components/common/you-might-like/you-might-like-skeleton";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import { useProductsQuery } from "@/shared/hooks";
import type { DTO } from "@/shared/services";
import { useMemo, useSyncExternalStore } from "react";

interface YouMightLikeBlockProps {
  excludeProductId: number;
  /** Данные с сервера (страница товара) — запрос с клиента не выполняется */
  initialProducts?: DTO.ProductListItemDto[];
  className?: string;
}

export function YouMightLikeBlock({ excludeProductId, initialProducts, className }: YouMightLikeBlockProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const hasInitial = Array.isArray(initialProducts) && initialProducts.length > 0;
  const query = useProductsQuery(
    { page: 1, perPage: 8, sort: "popular" },
    { enabled: mounted && !hasInitial },
  );

  const items: DTO.ProductListItemDto[] = useMemo(() => {
    if (hasInitial) {
      return initialProducts!.filter((p) => p.id !== excludeProductId).slice(0, 4);
    }
    const raw = query.data?.items ?? [];
    return raw.filter((p) => p.id !== excludeProductId).slice(0, 4);
  }, [hasInitial, initialProducts, query.data?.items, excludeProductId]);

  const isLoading = !hasInitial && (!mounted || (query.isLoading && items.length === 0));
  const isError = !hasInitial && mounted && query.isError;

  const baseClass = "mt-[160px] max-[1440px]:mt-[100px]";
  const sectionClassName = className ? `${baseClass} ${className}`.trim() : baseClass;

  if (isError) {
    return null;
  }

  return (
    <section className={sectionClassName} aria-label="Вам понравится">
      <h2 className="text-[38px] font-light leading-[120%] mb-8">Вам понравится</h2>

      {isLoading ? (
        <YouMightLikeSkeletonContent />
      ) : items.length === 0 ? null : (
        <>
          {/* <1280px: слайдер */}
          <div className="xl:hidden w-full min-w-0 overflow-hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="ml-0 min-[577px]:-ml-2.5">
                {items.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-full shrink-0 pl-0 min-[577px]:basis-[calc(50%-5px)] min-[577px]:pl-2.5"
                  >
                    <div className="w-full min-w-0 h-[500px] min-[769px]:h-[800px] min-[1440px]:h-[1080px]">
                      <ProductCard
                        product={product}
                        variant="favorites"
                        className="h-full"
                        imageFill
                        priority={false}
                        imageSizes="(max-width: 576px) 100vw, 50vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          {/* ≥1280px: 2 колонки; ≥1600px: 4 колонки */}
          <div className="hidden xl:grid xl:grid-cols-2 xl:gap-4 min-[1600px]:!grid-cols-4 min-[1600px]:!gap-6 w-full min-w-0 overflow-hidden">
            {items.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in-up min-w-0"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
              >
                <ProductCard
                  product={product}
                  variant="favorites"
                  priority={index === 0}
                  imageSizes="(max-width: 1600px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
