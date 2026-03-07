/**
 * Loading для главной. Скелетон первого экрана, виды спорта, новинок и бестселлеров.
 * Адаптивы соответствуют реальным компонентам.
 */
import { Container } from "@/shared/components/common";
import { FirstScreenSkeleton } from "@/shared/components/common/skeleton";
import { Skeleton } from "@/shared/components/ui/skeleton";

/** Секция карусели видов спорта: высоты как у SportTypesCarousel */
function SportTypesSkeletonSection() {
  return (
    <div className="mx-auto w-full max-w-[1920px]">
      <div className="flex overflow-hidden">
        {[1, 2].map((i) => (
          <div key={i} className="relative flex-shrink-0 basis-full min-[577px]:basis-1/2">
            <Skeleton className="h-[650px] min-[577px]:h-[520px] min-[769px]:h-[765px] min-[1025px]:h-[820px] min-[1281px]:h-[800px] min-[1441px]:h-[920px] min-[1601px]:h-[1080px] w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Общий скелетон для секций «Новинки» / «Бестселлеры».
 * ≤1280px: 1 карточка на ≤576px, 2 карточки >576px (слайдер).
 * >1280px: сетка 2 колонки, 4 карточки.
 */
function ProductsSectionSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <>
      <Skeleton className={`h-[64px] ${titleWidth} md:h-[120px] rounded-md`} />
      <Skeleton className="h-[40px] w-[150px] self-end mt-[25px] mb-6 rounded-md" />

      {/* ≤1280px: слайдер */}
      <div className="xl:hidden w-full overflow-hidden mt-6 flex ml-0 min-[577px]:-ml-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 basis-full min-[577px]:basis-[calc(50%-5px)] min-[577px]:pl-2.5 min-w-0 flex flex-col"
          >
            <Skeleton className="w-full h-[820px] min-[577px]:h-[560px] min-[769px]:h-[800px] min-[1440px]:h-[1080px] rounded-lg" />
            <div className="flex flex-col gap-[15px] mt-5">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* >1280px: сетка 2×2 */}
      <div className="hidden xl:grid xl:grid-cols-2 xl:gap-2.5 min-[1440px]:!gap-5 w-full mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col min-w-0 w-full h-[800px] min-[1440px]:h-[1080px]">
            <Skeleton className="w-full flex-1 min-h-0 rounded-lg" />
            <div className="flex flex-col gap-[15px] mt-5 shrink-0">
              <Skeleton className="h-[36px] w-3/4" />
              <Skeleton className="h-[30px] w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      <FirstScreenSkeleton />

      <SportTypesSkeletonSection />

      <Container className="mt-[160px] max-[1440px]:mt-[100px] flex flex-col justify-between">
        <ProductsSectionSkeleton titleWidth="w-[200px] md:w-[300px]" />
      </Container>

      <Container className="mt-[160px] max-[1440px]:mt-[100px] flex flex-col justify-between pb-[100px]">
        <ProductsSectionSkeleton titleWidth="w-[300px] md:w-[400px]" />
      </Container>
    </div>
  );
}
