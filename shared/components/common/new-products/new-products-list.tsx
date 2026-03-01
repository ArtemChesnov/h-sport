"use client";

import React from "react";

import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import { useProductsQuery } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import type { DTO } from "@/shared/services";
import { Container } from "../layout";
import { PromoButton } from "../ui";
import { NewProductsCard } from "./new-products-card";
import { NewProductsSkeleton } from "./new-products-skeleton";

interface Props {
  className?: string;
  initialData?: DTO.ProductListItemDto[]; // SSR данные для улучшения LCP
}

export const NewProductsList: React.FC<Props> = ({ className, initialData }) => {
  const query = useProductsQuery(
    {
      page: 1,
      perPage: 3,
      sort: "new",
    },
    {
      initialData: initialData
        ? {
            items: initialData,
            meta: { page: 1, perPage: 3, total: initialData.length, pages: 1 },
          }
        : undefined,
    }
  );

  const items: DTO.ProductListItemDto[] = query.data?.items ?? initialData ?? [];
  const showSkeleton = query.isLoading && items.length === 0;
  const isError = query.isError ?? false;

  return (
    <Container
      className={cn("mt-[160px] flex flex-col justify-between max-[1440px]:mt-[100px]", className)}
    >
      <h3 className="text-[120px] font-light leading-[120%]  max-[768px]:text-[42px] max-[1440px]:text-[62px] max-[1600px]:text-[82px] max-[1920px]:text-[102px]  ">
        Новинки
      </h3>

      <PromoButton
        _variant="ghost"
        className="my-2 self-end text-[18px] md:text-[20px] min-[1024px]:my-4"
        text="Смотреть все"
        href="/catalog?sort=new"
        keepIconColorOnHover
      />

      {showSkeleton ? (
        <NewProductsSkeleton />
      ) : isError ? (
        <p className="mt-6 text-lg text-muted-foreground">
          Не удалось загрузить новинки. Попробуй обновить страницу позже.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-lg text-muted-foreground">Пока нет добавленных товаров.</p>
      ) : (
        <>
          {/* ≤1280px: слайдер; ≤576px — 1 карточка, >576px — 2, ≥1024px — 3 карточки */}
          <div className="xl:hidden w-full min-w-0 overflow-hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="ml-0 min-[577px]:-ml-2.5 min-[1024px]:-ml-2.5">
                {items.map((item) => (
                  <CarouselItem
                    key={item.id}
                    className="basis-full shrink-0 pl-0 min-[577px]:basis-[calc(50%-5px)] min-[577px]:pl-2.5 min-[1024px]:basis-[calc(33.333%-7px)] min-[1024px]:pl-2.5"
                  >
                    <div className="w-full min-w-0 h-[500px] min-[769px]:h-[800px] min-[1440px]:h-[1080px]">
                      <NewProductsCard
                        name={item.name}
                        price={item.price}
                        slug={item.slug}
                        imageUrl={item.previewImage || "/assets/images/sport-types/fitness.webp"}
                        priority
                        fillHeight
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          {/* >1280px: сетка 3 колонки */}
          <div className="hidden xl:grid xl:grid-cols-3 xl:gap-2.5 min-[1440px]:!gap-5 w-full min-w-0 overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex min-w-0 overflow-hidden w-full h-[800px] min-[1440px]:h-[1080px]"
              >
                <NewProductsCard
                  name={item.name}
                  price={item.price}
                  slug={item.slug}
                  imageUrl={item.previewImage || "/assets/images/sport-types/fitness.webp"}
                  priority
                />
              </div>
            ))}
          </div>
        </>
      )}
    </Container>
  );
};
