/**
 * Страница каталога (SSR, force-dynamic).
 */

import { CATALOG_DEFAULT_PER_PAGE } from "@/shared/constants";
import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import { PRODUCT_SERVER } from "@/shared/services";
import { Metadata } from "next";
import { Suspense } from "react";
import { CatalogClient } from "./_components/catalog-client";

export const metadata: Metadata = generateSEOMetadata({
  title: "Каталог",
  description: "Каталог спортивной одежды H-Sport. Широкий выбор товаров для активного образа жизни.",
  url: "/catalog",
});

/** Сборка без БД: страница рендерится по первому запросу (SSR). */
export const dynamic = "force-dynamic";

function CatalogFallback() {
  return <div className="min-h-[400px] w-full animate-pulse rounded bg-muted" />;
}

export default async function CatalogPage() {
  const { items, meta } = await PRODUCT_SERVER.getInitialCatalogProducts(CATALOG_DEFAULT_PER_PAGE);

  return (
    <Suspense fallback={<CatalogFallback />}>
      <CatalogClient
        initialProducts={items}
        initialMeta={meta}
      />
    </Suspense>
  );
}
