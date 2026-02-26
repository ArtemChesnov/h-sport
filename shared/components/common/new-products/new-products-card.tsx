"use client";

import { ProductCardTextBlock } from "@/shared/components/common/product/product-card-text-block";
import { cn } from "@/shared/lib";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  name: string;
  price: number;
  slug: string;
  imageUrl: string;
  className?: string;
  priority?: boolean;
  /** Заполнять высоту контейнера (карусель ≤1280px), без фиксированного aspect */
  fillHeight?: boolean;
}

export const NewProductsCard: React.FC<Props> = ({
  className,
  name,
  price,
  slug,
  imageUrl,
  priority = false,
  fillHeight = false,
}) => {
  const href = `/product/${slug}`;

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" prefetch={false} className="block w-full min-w-0 h-full group">
      <div className={cn("w-full min-w-0 overflow-hidden flex flex-col h-full", className)}>
        <div
          className={cn(
            "relative w-full flex-1 min-h-0 overflow-hidden",
            !fillHeight && "aspect-[607/1014]",
          )}
        >
          <Image
            width={607}
            height={1014}
            src={imageUrl || "/assets/images/fitness.webp"}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 1280px) 50vw, (max-width: 1920px) 50vw, 607px"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        </div>
        <ProductCardTextBlock name={name} price={price} className={className} />
      </div>
    </Link>
  );
};
