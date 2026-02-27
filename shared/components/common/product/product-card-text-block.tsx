import { cn } from "@/shared/lib/utils";
import { formatMoney } from "@/shared/lib/formatters";
export type ProductCardTextBlockProps = {
  name: string;
  price: number;
  className?: string;
};

/**
 * Общий блок названия и цены для карточек товара.
 * Используется в ProductCard и NewProductsCard.
 */
export function ProductCardTextBlock({ name, price, className }: ProductCardTextBlockProps) {
  return (
    <div className={cn("flex flex-col gap-2 mt-3", className)}>
      <h3 className="font-light leading-[100%] text-[36px] max-[1280px]:text-[28px] max-[768px]:text-[24px] max-[576px]:text-[20px]">
        {name}
      </h3>
      <p className="font-light leading-[100%] text-[32px] max-[1280px]:text-[22px] max-[768px]:text-[20px] max-[576px]:text-[18px]">
        {formatMoney(price)}
      </p>
    </div>
  );
}
