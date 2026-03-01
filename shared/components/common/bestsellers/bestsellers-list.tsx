"use client";

import { Container, PromoButton } from "@/shared/components/common";
import { ProductCard } from "@/shared/components/common/product/product-card";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import { useProductsQuery } from "@/shared/hooks";
import type { DTO } from "@/shared/services";
import { BestSellersSkeleton } from "./bestsellers-skeleton";

interface BestSellersListProps {
  initialData?: DTO.ProductListItemDto[];
}

export function BestSellersList(props: BestSellersListProps = {}) {
  const { initialData } = props;

  const query = useProductsQuery(
    {
      page: 1,
      perPage: 3,
      sort: "popular",
    },
    {
      initialData: initialData
        ? { items: initialData, meta: { page: 1, perPage: 3, total: initialData.length, pages: 1 } }
        : undefined,
    }
  );

  const items: DTO.ProductListItemDto[] = query.data?.items ?? initialData ?? [];
  const showSkeleton = query.isLoading && items.length === 0;
  const isError = query.isError ?? false;

  return (
    <Container className="mt-40 flex flex-col justify-between max-[1440px]:mt-25">
      <h3 className="text-[120px] font-light leading-[120%]  max-[768px]:text-[42px] max-[1440px]:text-[62px] max-[1600px]:text-[82px] max-[1920px]:text-[102px]  ">
        Бестселлеры
      </h3>

      <PromoButton
        _variant="ghost"
        className="my-4 self-end text-[18px] md:text-[20px] max-[1024px]:my-4"
        text="Смотреть все"
        href="/catalog?sort=popular"
        keepIconColorOnHover
      />

      {showSkeleton ? (
        <BestSellersSkeleton />
      ) : isError ? (
        <p className=" text-lg text-muted-foreground">
          Не удалось загрузить бестселлеры. Попробуй обновить страницу позже.
        </p>
      ) : items.length === 0 ? (
        <p className=" text-lg text-muted-foreground">Пока нет популярных товаров.</p>
      ) : (
        <>
          {/* ≤1280px: слайдер; ≤576px — 1 карточка, >576px — 2, ≥1024px — 3 карточки */}
          <div className="xl:hidden w-full min-w-0 overflow-hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="ml-0 min-[577px]:-ml-2.5 min-[1024px]:-ml-2.5">
                {items.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-full shrink-0 pl-0 min-[577px]:basis-[calc(50%-5px)] min-[577px]:pl-2.5 min-[1024px]:basis-[calc(33.333%-7px)] min-[1024px]:pl-2.5"
                  >
                    <div className="w-full min-w-0 h-[500px] min-[769px]:h-[800px] min-[1440px]:h-[1080px]">
                      <ProductCard
                        product={product}
                        variant="favorites"
                        className="h-full"
                        imageFill
                        priority
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          {/* >1280px: сетка 3 колонки */}
          <div className="hidden xl:grid xl:grid-cols-3 xl:gap-2.5 min-[1440px]:!gap-5 w-full min-w-0 overflow-hidden ">
            {items.map((product) => (
              <div
                key={product.id}
                className="flex min-w-0 overflow-hidden w-full h-[800px] min-[1440px]:h-[1080px]"
              >
                <ProductCard
                  product={product}
                  variant="favorites"
                  className="h-full"
                  imageFill
                  priority
                />
              </div>
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
