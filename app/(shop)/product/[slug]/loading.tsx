/**
 * Loading для товара. Скелетон карточки + блок «Вам понравится»,
 * чтобы место под блок было занято сразу и не было скачка при появлении контента.
 */
import { YouMightLikeSkeleton } from "@/shared/components/common/you-might-like/you-might-like-skeleton";
import { ProductSkeleton } from "./_components/product-skeleton";

export default function ProductLoading() {
  return (
    <>
      <ProductSkeleton />
      <div className="mx-auto max-w-[1860px] px-4 lg:px-6 pb-20">
        <YouMightLikeSkeleton />
      </div>
    </>
  );
}
