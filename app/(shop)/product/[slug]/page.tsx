import {
  getPopularProducts,
  getProductBySlug,
  getProductSlugsForPreRender,
} from "@/shared/services/server";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { ProductSkeleton } from "./_components/product-skeleton";
import { generateMetadata } from "./generate-metadata";

const ProductSlugClient = dynamic(
  () =>
    import("./_components/product-slug-client").then((m) => ({
      default: m.ProductSlugClient,
    })),
  { loading: () => <ProductSkeleton /> }
);

export { generateMetadata };

/**
 * ISR fallback: 2 ч (public). Основная ревалидация — on-demand при сохранении товара в админке.
 */
export const revalidate = 7200;

/**
 * Генерирует статические параметры для топ-товаров
 * Остальные товары будут генерироваться по требованию (on-demand)
 *
 * ВАЖНО: Pre-render включается ТОЛЬКО при явном ENABLE_PRODUCT_PRE_RENDER=true
 * По умолчанию все страницы товаров генерируются динамически (ISR on-demand)
 * Это гарантирует успешную сборку в CI/CD без доступа к БД
 */
export async function generateStaticParams() {
  // Pre-render только при явном включении (для production с доступом к БД)
  // По умолчанию возвращаем пустой массив - страницы генерируются по требованию
  if (process.env.ENABLE_PRODUCT_PRE_RENDER !== "true") {
    return [];
  }

  // Проверяем наличие DATABASE_URL
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    // Получаем топ-100 товаров для pre-render через server-сервис
    const topProducts = await getProductSlugsForPreRender(100);
    return topProducts;
  } catch (error) {
    // В случае ошибки возвращаем пустой массив - товары будут генерироваться по требованию
    const { logger } = await import("@/shared/lib/logger");
    logger.error("Error generating static params for products:", error);
    return [];
  }
}

type ProductSlugPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Серверный page-обёртка с ISR.
 *
 * Стратегия:
 * - Pre-render топ-100 товаров при сборке (ENABLE_PRODUCT_PRE_RENDER=true)
 * - Остальные товары генерируются по требованию
 * - On-demand ревалидация при создании/обновлении/удалении товара в админке
 * - Fallback revalidate = 2 ч
 */
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
