"use client";

import { Container } from "@/shared/components/common";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Скелетон для страницы сертификата.
 */
export function CertificatePageSkeleton() {
  return (
    <Container>
      <div className="flex items-center gap-2 mb-8">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div
        className={
          "flex flex-col items-center " +
          "gap-4 mt-6 min-[576px]:gap-5 min-[576px]:mt-8 min-[768px]:gap-6 min-[768px]:mt-10 min-[1024px]:mt-12 min-[1280px]:mt-15"
        }
      >
        <Skeleton className="h-10 w-3/4 max-w-[600px]" />
        <Skeleton className="h-20 w-full max-w-[500px]" />
      </div>

      <Skeleton
        className={
          "mt-4 min-[576px]:mt-6 min-[768px]:mt-10 min-[1024px]:mt-16 min-[1280px]:mt-20 min-[1920px]:mt-24 " +
          "h-8 w-2/3 max-w-[500px] mx-auto"
        }
      />

      <div
        className={
          "grid grid-cols-2 gap-2.5 min-[769px]:gap-5 w-full " +
          "mt-4 min-[576px]:mt-6 min-[768px]:mt-8"
        }
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className={
              "w-full " +
              "h-[265px] min-[576px]:h-[390px] min-[768px]:h-[530px] min-[1024px]:h-[700px] min-[1280px]:h-[880px] min-[1440px]:h-[1000px] min-[1920px]:h-[1360px]"
            }
          />
        ))}
      </div>
    </Container>
  );
}
