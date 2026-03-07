/**
 * Скелетон FirstScreen (главный экран).
 * Позиция и размеры плашки соответствуют FirstScreen: left, центрирование на мобилках, w-fit/max-md:w-auto.
 */
import { Container } from "@/shared/components/common";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function FirstScreenSkeleton() {
  return (
    <div className="relative mx-auto">
      <Skeleton className="h-screen w-full max-w-[1920px] mx-auto rounded-md" />
      <Container className="relative">
        <div className="absolute bottom-10 left-[12px] min-[1025px]:left-[30px] flex flex-col min-[1920px]:gap-8 min-[1440px]:gap-6 min-[1024px]:gap-6 gap-4 items-start min-[1024px]:p-10 p-6 w-fit max-md:w-auto max-md:left-1/2 max-md:-translate-x-1/2 bg-[color-mix(in_oklab,oklch(1_0_0)_50%,transparent)] backdrop-blur-xl rounded-[10px]">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-[22px] min-[576px]:h-[32px] min-[768px]:h-[32px] min-[1024px]:h-[42px] min-[1440px]:h-[52px] min-[1920px]:h-[76px] w-full max-w-[280px] min-[576px]:max-w-[320px] min-[768px]:max-w-[400px] min-[1024px]:max-w-[500px] min-[1440px]:max-w-[600px] min-[1920px]:max-w-[800px] rounded-md" />
            <Skeleton className="h-10 min-[576px]:h-12 min-[768px]:h-14 min-[1024px]:h-[88px] w-full max-w-[260px] min-[576px]:max-w-[320px] min-[768px]:max-w-[400px] min-[1024px]:max-w-[600px] min-[1440px]:max-w-[700px] min-[1920px]:max-w-[1000px] rounded-md" />
          </div>
          <Skeleton className="h-14 min-[1920px]:h-[48px] w-full max-w-[200px] min-[1024px]:max-w-[280px] rounded-[6px]" />
        </div>
      </Container>
    </div>
  );
}
