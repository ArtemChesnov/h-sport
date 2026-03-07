/**
 * Скелетон для страницы корзины.
 * Соответствует структуре: хлебные крошки, заголовок, список товаров + саммари.
 * Layout: flex-col до 1080px (саммари под списком), с 1081px — два столбца.
 * Карточка товара: до 460px — колонка (фото сверху), с 461px — строка (фото слева).
 * @param omitHeader — когда true, не рендерить скелетон крошек/заголовка (уже есть реальные ShopBreadcrumbs снаружи)
 */
import { PageSkeletonBreadcrumb, PageSkeletonTitle } from "@/shared/components/common/skeleton";
import { Skeleton } from "@/shared/components/ui/skeleton";

function CartItemCardSkeleton() {
  return (
    <div className="relative flex w-full h-fit flex-col max-[460px]:gap-4 min-[461px]:flex-row min-[461px]:items-center min-w-0 rounded-[10px]">
      {/* Те же размеры, что и у cart-item-card: 460px — колонка, 461+ — строка с фото 150/200/240 */}
      <Skeleton
        className="shrink-0 rounded-[10px] overflow-hidden max-[460px]:w-full max-[460px]:h-[320px] max-[460px]:aspect-square min-[461px]:w-[150px] min-[461px]:h-[150px] min-[769px]:w-[200px] min-[769px]:h-[200px] min-[1441px]:w-[240px] min-[1441px]:h-[240px]"
        aria-hidden
      />
      <div className="flex min-[461px]:justify-between w-full px-5 max-[460px]:pt-0 min-[461px]:items-start">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-[10px] mt-1" />
        </div>
        <div className="flex flex-col justify-between items-end gap-2">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function CartPageSkeleton({ omitHeader = false }: { omitHeader?: boolean }) {
  return (
    <>
      {!omitHeader && (
        <section className="mt-15">
          <PageSkeletonBreadcrumb />
          <PageSkeletonTitle />
        </section>
      )}
      <section className="flex flex-col min-[1081px]:flex-row justify-between mt-10 gap-10">
        {/* Список товаров — те же классы, что и CartItemList */}
        <div className="w-235 max-[1080px]:w-full flex flex-col pr-2 space-y-0">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <CartItemCardSkeleton />
              {i < 3 && <div className="w-full h-0.75 bg-primary/20 my-8 rounded-full" />}
            </div>
          ))}
        </div>
        {/* Саммари — те же классы, что у обёртки и CartSummaryCard containerClassName */}
        <div className="w-full min-[1081px]:min-w-114 min-[1081px]:max-w-175 min-[1081px]:flex-1 min-[1081px]:basis-0">
          <div className="p-10 bg-[#F4F0F0] h-fit w-full min-[1081px]:min-w-114 min-[1081px]:max-w-175 flex flex-col justify-between min-h-53 rounded-[10px]">
            <div className="flex flex-col justify-between">
              <Skeleton className="h-8 w-32 mb-10 rounded-md max-[768px]:h-6 max-[768px]:mb-6" />
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-5 w-28 rounded-md" />
                  </div>
                  <Skeleton className="h-11 w-full rounded-[10px]" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                </div>
                <Skeleton className="w-full h-0.75 rounded-full bg-primary/30" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-6 w-24 rounded-md" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-10">
              <Skeleton className="h-14 w-full rounded-[10px]" />
              <Skeleton className="h-14 w-full rounded-[10px]" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
