import { ProductCardSkeleton } from "@/shared/components/common/skeleton/product-card-skeleton";

type MosaicBlockSkeletonProps = {
  type?: "A" | "B";
};

/**
 * Skeleton для мозаичного блока
 * Структурно идентичен MosaicBlock
 *
 * type A: большая слева + две малых справа
 * type B: две малых слева + большая справа
 */
export function MosaicBlockSkeleton({ type = "A" }: MosaicBlockSkeletonProps) {
  const gridClasses =
    "grid grid-cols-2 gap-[10px] lg:gap-4 xl:gap-5 " +
    "auto-rows-[30px] sm:auto-rows-[50px] lg:auto-rows-[60px] xl:auto-rows-[115px]";

  if (type === "A") {
    // большая слева + две малых справа (как в MosaicBlock)
    return (
      <div className={gridClasses}>
        <div className="row-span-10">
          <ProductCardSkeleton />
        </div>
        <div className="row-span-5">
          <ProductCardSkeleton />
        </div>
        <div className="row-span-5">
          <ProductCardSkeleton />
        </div>
      </div>
    );
  }

  // type === "B": две малых слева + большая справа
  return (
    <div className={gridClasses}>
      <div className="row-span-5">
        <ProductCardSkeleton />
      </div>
      <div className="row-span-10 col-start-2 row-start-1">
        <ProductCardSkeleton />
      </div>
      <div className="row-span-5">
        <ProductCardSkeleton />
      </div>
    </div>
  );
}
