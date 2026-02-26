import { ProductCard } from "@/shared/components/common";
import type { DTO } from "@/shared/services";

type BlockType = "A" | "B";

type Block = {
  type: BlockType;
  items: DTO.ProductListItemDto[];
};

type ProductCardVariant = "default" | "favorites";

/**
 * Один блок 2×N:
 *  - type A: большая слева + две малых справа
 *  - type B: две малых слева + большая справа
 *
 * Всегда 2 колонки (на мобилке тоже):
 *  - base row height уменьшается на меньших брейкпоинтах,
 *    чтобы большая карточка не была гигантской.
 *
 * auto-rows:
 *  - <640px: 70px  → big ≈ 700px, small ≈ 350px
 *  - ≥640px: 80px  → big ≈ 800px, small ≈ 400px
 *  - ≥1024px: 95px → big ≈ 950px, small ≈ 475px
 *  - ≥1280px: 115px → big ≈ 1150px, small ≈ 575px
 */
export function MosaicBlock({
  type,
  items,
  isFirstBlock = false,
  cardVariant,
}: Block & { isFirstBlock?: boolean; cardVariant?: ProductCardVariant }) {
  const [first, second, third] = items;

  if (items.length === 0) return null;

  const gridClasses =
    "grid grid-cols-2 gap-[10px] lg:gap-4 xl:gap-5 " +
    "auto-rows-[30px] sm:auto-rows-[50px] lg:auto-rows-[60px] xl:auto-rows-[115px]";

  if (type === "A") {
    // большая слева + две малых справа
    const big = first;
    const small1 = second;
    const small2 = third;

    return (
      <div className={gridClasses}>
        {big && (
          <div className="row-span-10 min-h-0 overflow-hidden flex">
            <ProductCard
              product={big}
              priority={isFirstBlock}
              variant={cardVariant}
              imageFill
              className="h-full w-full"
            />
          </div>
        )}
        {small1 && (
          <div className="row-span-5 min-h-0 overflow-hidden flex">
            <ProductCard
              product={small1}
              variant={cardVariant}
              imageFill
              className="h-full w-full"
            />
          </div>
        )}
        {small2 && (
          <div className="row-span-5 min-h-0 overflow-hidden flex">
            <ProductCard
              product={small2}
              variant={cardVariant}
              imageFill
              className="h-full w-full"
            />
          </div>
        )}
      </div>
    );
  }

  // type === "B": две малых слева + большая справа
  const small1 = first;
  const small2 = second;
  const big = third;

  return (
    <div className={gridClasses}>
      {small1 && (
        <div className="row-span-5 min-h-0 overflow-hidden flex">
          <ProductCard
            product={small1}
            priority={isFirstBlock}
            variant={cardVariant}
            imageFill
            className="h-full w-full"
          />
        </div>
      )}
      {big && (
        <div className="row-span-10 col-start-2 row-start-1 min-h-0 overflow-hidden flex">
          <ProductCard
            product={big}
            variant={cardVariant}
            imageFill
            className="h-full w-full"
          />
        </div>
      )}
      {small2 && (
        <div className="row-span-5 min-h-0 overflow-hidden flex">
          <ProductCard
            product={small2}
            variant={cardVariant}
            imageFill
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
}
