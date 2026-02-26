/**
 * Компонент топа товаров в брошенных корзинах
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui";
import { MetricsSection } from "@/shared/components/admin";
import { METRICS_CONSTANTS } from "@/shared/constants";
import { ShoppingCart, Info } from "lucide-react";
import Link from "next/link";

type AbandonedCartsTopProductsProps = {
  products: Array<{
    id: number;
    name: string;
    slug?: string | null;
    count: number;
  }>;
};

export function AbandonedCartsTopProducts({ products }: AbandonedCartsTopProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <MetricsSection title="Топ товары в брошенных корзинах" description="Какие товары чаще всего остаются в корзинах">
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="rounded-2xl border shadow-sm cursor-help">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Топ товары</CardTitle>
                <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
              </div>
              <CardDescription className="text-xs">Чаще всего остаются в брошенных корзинах</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.slice(0, METRICS_CONSTANTS.TOP_ITEMS_COUNT).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {product.slug ? (
                      <Link
                        href={`/admin/products/${product.slug}`}
                        className="text-sm font-medium hover:text-primary hover:underline transition-colors flex-1"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium flex-1">{product.name}</span>
                    )}
                    <span className="text-sm font-semibold ml-4">{product.count} раз</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <p className="text-xs leading-relaxed">
            Топ товаров, которые чаще всего остаются в брошенных корзинах. Помогает выявить проблемы с определенными товарами (цена, описание, фотографии) и оптимизировать их для повышения конверсии.
          </p>
        </TooltipContent>
      </Tooltip>
    </MetricsSection>
  );
}
