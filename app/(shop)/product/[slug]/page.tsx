import { getPopularProducts, getProductBySlug } from "@/shared/services/server";
import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ProductSkeleton } from "./_components/product-skeleton";
import { generateMetadata } from "./generate-metadata";

const ProductSlugClient = nextDynamic(
  () =>
    import("./_components/product-slug-client").then((m) => ({
      default: m.ProductSlugClient,
    })),
  { loading: () => <ProductSkeleton /> }
);

export { generateMetadata };

/**
 * Динамический рендеринг (без ISR).
 *
 * ISR (revalidate) несовместим с cookies() в корневом layout (CsrfMeta),
 * что вызывает DYNAMIC_SERVER_USAGE в Next.js 15.
 * Данные кэшируются in-memory через getOrSetAsync (TTL 30 мин для товара,
 * TTL 10 мин для популярных), поэтому производительность не страдает.
 */
export const dynamic = "force-dynamic";

type ProductSlugPageProps = {
  params: Promise<{ slug: string }>;
};
const YOU_MIGHT_LIKE_FETCH = 12;
const YOU_MIGHT_LIKE_DISPLAY = 4;

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  let slug: string;
  try {
    const resolved = await params;
    slug = resolved?.slug;
    if (!slug || typeof slug !== "string") {
      notFound();
    }
  } catch {
    notFound();
  }

  let initialProduct: Awaited<ReturnType<typeof getProductBySlug>> = null;
  let popularList: Awaited<ReturnType<typeof getPopularProducts>> = [];

  try {
    const [product, popular] = await Promise.all([
      getProductBySlug(slug),
      getPopularProducts(YOU_MIGHT_LIKE_FETCH),
    ]);
    initialProduct = product;
    popularList = Array.isArray(popular) ? popular : [];
  } catch {
    // Ошибка БД, кэша и т.д. — показываем «не найден», а не 500
    notFound();
  }

  const youMightLike =
    initialProduct != null
      ? popularList.filter((p) => p.id !== initialProduct!.id).slice(0, YOU_MIGHT_LIKE_DISPLAY)
      : [];

  return (
    <>
      <ProductSlugClient
        slug={slug}
        initialProduct={initialProduct ?? undefined}
        youMightLikeProducts={youMightLike}
      />
    </>
  );
}
