"use client";

import { BestSellersList } from "@/shared/components/common/bestsellers/bestsellers-list";
import { NewProductsList } from "@/shared/components/common/new-products/new-products-list";
import type { DTO } from "@/shared/services";

interface HomeClientProps {
  newProducts: DTO.ProductListItemDto[];
  bestSellers: DTO.ProductListItemDto[];
}

/**
 * Client Component для главной страницы.
 *
 * Компоненты NewProductsList и BestSellersList сами обрабатывают монтирование
 * и используют initialData до гидратации, что обеспечивает плавный рендер.
 */
export function HomeClient({ newProducts, bestSellers }: HomeClientProps) {
  return (
    <>
      <NewProductsList initialData={newProducts} />
      <BestSellersList initialData={bestSellers} />
    </>
  );
}
