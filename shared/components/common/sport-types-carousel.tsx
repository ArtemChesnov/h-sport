"use client";

import { useShopNav } from "@/shared/contexts";
import { cn } from "@/shared/lib/utils";
import Image from "next/image";
import * as React from "react";

import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { PromoButton } from "./ui";

interface Props {
  className?: string;
}

const sportTypes = [
  { type: "Фитнес", src: "/assets/images/sport-types/fitness.webp" },
  { type: "Бег", src: "/assets/images/sport-types/running.webp" },
  { type: "Паддл", src: "/assets/images/sport-types/paddle.webp" },
  { type: "Гимнастика", src: "/assets/images/sport-types/gymnastic.webp" },
  { type: "Йога", src: "/assets/images/sport-types/yoga.webp" },
  { type: "Теннис", src: "/assets/images/sport-types/tennis.webp" },
  { type: "Пилатес", src: "/assets/images/sport-types/pilates.webp" },
  { type: "Танцы", src: "/assets/images/sport-types/dance.webp" },
  { type: "Аэробика", src: "/assets/images/sport-types/aerobic.webp" },
];

export const SportTypesCarousel: React.FC<Props> = ({ className }) => {
  const { setPendingPath } = useShopNav();

  const handleCatalogClick = () => {
    setPendingPath("/catalog");
  };

  return (
    <div className={cn("relative mx-auto", className)}>
      <div className="relative w-full max-w-[1920px] mx-auto overflow-hidden">
        <Carousel opts={{ align: "start", loop: true }} className="w-full min-w-0 overflow-hidden">
          <CarouselContent className="!ml-0">
            {sportTypes.map((item, index) => (
              <CarouselItem
                key={index}
                className="basis-full shrink-0 !pl-0 min-[577px]:basis-1/2 min-[1024px]:basis-1/3 relative cursor-pointer"
              >
                <div className="relative w-full h-[650px] min-[577px]:h-[520px] min-[769px]:h-[765px] min-[1025px]:h-[820px] min-[1281px]:h-[800px] min-[1441px]:h-[920px] min-[1601px]:h-[1080px] overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.type}
                    fill
                    className="object-cover object-[50%_0%]"
                    sizes="(min-width: 1024px) 33.33vw, (min-width: 577px) 50vw, 100vw"
                    priority={index === 0}
                    loading={index === 0 ? undefined : "lazy"}
                  />

                  <div className="absolute bottom-4 left-1/2 flex max-w-132 -translate-x-1/2 flex-col items-center gap-1.5 rounded-[10px] bg-[color-mix(in_oklab,oklch(1_0_0)_60%,transparent)] backdrop-blur-xl px-4 py-2.5 min-[768px]:px-5 min-[768px]:py-3 min-[1280px]:px-10 min-[1280px]:py-5">
                    <h1 className="text-center text-[22px] font-semibold uppercase leading-[120%] text-foreground sm:text-[28px] lg:text-[40px] min-[1280px]:text-[56px] mb-1 min-[768px]:mb-2">
                      {item.type}
                    </h1>
                    <Link href="/catalog" onClick={handleCatalogClick}>
                      <PromoButton
                        _variant="outline"
                        className="text-[12px] rounded-[10px] uppercase min-[768px]:text-[16px]"
                        text="Перейти в каталог"
                      />
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
