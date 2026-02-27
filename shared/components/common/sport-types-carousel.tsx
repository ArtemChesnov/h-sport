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
  { type: "Фитнес", src: "/assets/images/fitness.webp" },
  { type: "Бег", src: "/assets/images/running.webp" },
  { type: "Паддл", src: "/assets/images/paddle.webp" },
  { type: "Гимнастика", src: "/assets/images/gimnastic.webp" },
  { type: "Йога", src: "/assets/images/yoga.webp" },
  { type: "Теннис", src: "/assets/images/tennis.webp" },
  { type: "Пилатес", src: "/assets/images/pilates.webp" },
  { type: "Танцы", src: "/assets/images/dance.webp" },
  { type: "Аэробика", src: "/assets/images/aerobic.webp" },
];

export const SportTypesCarousel: React.FC<Props> = ({ className }) => {
  const { setPendingPath } = useShopNav();

  const handleCatalogClick = () => {
    setPendingPath("/catalog");
  };

  return (
    <div className={cn("mx-auto w-full max-w-[1920px] ", className)}>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {sportTypes.map((item, index) => (
            <CarouselItem
              key={index}
              className="relative m-0 basis-full shrink-0 pl-0 min-[577px]:basis-1/2 cursor-pointer"
            >
              <div className="relative h-[500px] min-[769px]:h-[800px] min-[1440px]:h-[1080px] w-full overflow-hidden">
                <Image
                  src={item.src}
                  alt={item.type}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                />

                <div className="absolute bottom-10 left-1/2 flex max-w-132 -translate-x-1/2 flex-col items-center gap-1.5 min-[1280px]:px-10 min-[1280px]:py-5 rounded-[10px] bg-white/50 backdrop-blur-xl px-5 py-2.5">
                  <h1 className="text-center text-[32px] font-semibold uppercase leading-[120%] text-foreground lg:text-[56px] mb-2">
                    {item.type}
                  </h1>
                  <Link href="/catalog" onClick={handleCatalogClick}>
                    <PromoButton
                      _variant="outline"
                      className="text-[16px] rounded-[10px] uppercase"
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
  );
};
