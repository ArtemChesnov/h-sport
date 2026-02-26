/**
 * Скелетон FirstScreen (главный экран).
 * Размеры соответствуют: h2 text-[76px], h2 text-[40px] leading-[110%] (2 строки), PromoButton.
 */
import { Container } from "@/shared/components/common";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function FirstScreenSkeleton() {
  return (
    <div className="relative mx-auto">
      <Skeleton className="h-screen w-full max-w-[1920px] mx-auto rounded-md" />
      <Container className="relative">
        <div className="absolute bottom-10 flex flex-col gap-10 items-start p-5 w-[1323px] bg-white/50 backdrop-blur-xl rounded-[10px]">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-[76px] w-[1284px] max-w-[calc(100%-2rem)] rounded-md" />
            <Skeleton className="h-[88px] w-[1284px] max-w-[calc(100%-2rem)] rounded-md" />
          </div>
          <Skeleton className="h-[48px] w-[500px] max-w-[calc(100%-2rem)] rounded-[6px]" />
        </div>
      </Container>
    </div>
  );
}
