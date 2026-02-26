// Server Component для главной страницы - улучшает LCP за счет SSR данных
import { FirstScreen, SportTypesCarousel } from "@/shared/components/common";
import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import { PRODUCT_SERVER } from "@/shared/services";
import { Metadata } from "next";
import { Suspense } from "react";
import { HomeClient } from "../home-client";
import { NewsletterToastHandler } from "./newsletter-toast-handler";

export const metadata: Metadata = generateSEOMetadata({
  title: "Главная",
  description:
    "H-Sport - магазин женской спортивной одежды и аксессуаров. Качественная спортивная форма, удобная обувь и аксессуары для активного образа жизни.",
  url: "/",
});

/** Сборка без БД: страница рендерится по первому запросу (SSR). */
export const dynamic = "force-dynamic";

export default async function Home() {
  const [newProducts, bestSellers] = await Promise.all([
    PRODUCT_SERVER.getNewProducts(4),
    PRODUCT_SERVER.getBestSellers(4, 100),
  ]);

  return (
    <>
      <Suspense fallback={null}>
        <NewsletterToastHandler />
      </Suspense>
      <FirstScreen />
      <SportTypesCarousel />
      <HomeClient newProducts={newProducts} bestSellers={bestSellers} />
    </>
  );
}
