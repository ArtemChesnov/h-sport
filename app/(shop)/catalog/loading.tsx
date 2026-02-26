/**
 * Loading для каталога. Скелетоны карточек в соответствии с версткой каталога.
 */
import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import { CatalogSidebar } from "@/shared/components/common/catalog/catalog-sidebar";
import { ProductCardSkeleton } from "@/shared/components/common/skeleton/product-card-skeleton";
import { MosaicBlockSkeleton } from "@/shared/components/common/product/mosaic-block-skeleton";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function CatalogLoading() {
  return (
    <Container>
      <section>
        <ShopBreadcrumbs />
      </section>

      <div className="mt-[60px] flex flex-col gap-8 lg:flex-row">
        <CatalogSidebar productsLoading={true} />

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>

          <section className="w-full min-w-0">
            <div className="w-full min-w-0 max-w-[1570px] space-y-2.5 lg:space-y-5">
              {/* ≤1280px: сетка 1 кол. до 410px, 2 кол. от 410px */}
              <div className="space-y-2.5 lg:space-y-5 xl:hidden min-w-0">
                <div className="grid grid-cols-1 min-[410px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-[10px] lg:gap-4 min-w-0 overflow-x-hidden">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`mobile-skel-${index}`}
                      className="min-w-0 aspect-[3/4] min-h-[280px] min-[410px]:min-h-[240px] min-[640px]:min-h-[320px] sm:min-h-[380px] overflow-hidden"
                    >
                      <ProductCardSkeleton />
                    </div>
                  ))}
                </div>
              </div>

              {/* ≥1280px: мозаичные блоки A/B */}
              <div className="hidden space-y-2.5 lg:space-y-5 xl:block">
                {[0, 1].map((index) => {
                  const type = index % 2 === 0 ? "A" : "B";
                  return <MosaicBlockSkeleton key={`desktop-skel-${index}`} type={type} />;
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
