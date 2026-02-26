/**
 * Генерация метаданных для страницы товара
 */

import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import { getProductBySlug } from "@/shared/services/server";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      return generateSEOMetadata({
        title: "Товар не найден",
        description: "Товар не найден",
        url: `/product/${slug}`,
      });
    }

    const image =
      product.images && product.images.length > 0 ? product.images[0] : "/logo-icon.png";

    return generateSEOMetadata({
      title: product.name,
      description: product.description || `${product.name} - купить в H-Sport`,
      image,
      url: `/product/${slug}`,
      type: "website",
    });
  } catch {
    return generateSEOMetadata({
      title: "Товар",
      description: "Страница товара",
      url: `/product/${slug}`,
    });
  }
}
