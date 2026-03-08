/**
 * Генерация метаданных для страницы товара.
 * Полностью обёрнуто в try/catch, чтобы любая ошибка не приводила к 500.
 */

import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import { getProductBySlug } from "@/shared/services/server";
import { Metadata } from "next";

const FALLBACK_METADATA: Metadata = {
  title: "Товар",
  description: "Страница товара",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  let slug = "";
  try {
    const resolved = await params;
    slug = typeof resolved?.slug === "string" ? resolved.slug : "";
  } catch {
    return FALLBACK_METADATA;
  }

  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      try {
        return generateSEOMetadata({
          title: "Товар не найден",
          description: "Товар не найден",
          url: `/product/${slug}`,
        });
      } catch {
        return FALLBACK_METADATA;
      }
    }

    const image =
      product.images && product.images.length > 0 ? product.images[0] : "/logo-icon.png";

    try {
      return generateSEOMetadata({
        title: product.name,
        description: product.description || `${product.name} - купить в H-Sport`,
        image,
        url: `/product/${slug}`,
        type: "website",
      });
    } catch {
      return FALLBACK_METADATA;
    }
  } catch {
    return FALLBACK_METADATA;
  }
}
