/**
 * Утилиты для SEO и мета-тегов
 */

import { getAppUrl } from "@/shared/lib/config/env";
import { Metadata } from "next";

interface SEOConfig {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

/**
 * Генерирует метаданные для страницы
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description = "H-Sport - магазин спортивной одежды и аксессуаров",
    image = "/logo-icon.png",
    url,
    type = "website",
  } = config;

  const siteUrl = getAppUrl();
  const fullImageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  return {
    title, // Без "| H-Sport" - template в корневом layout добавит автоматически
    description,
    ...(url && { alternates: { canonical: fullUrl } }),
    openGraph: {
      title: `${title} | H-Sport`, // Для OpenGraph оставляем полный title
      description,
      url: fullUrl,
      siteName: "H-Sport",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | H-Sport`, // Для Twitter оставляем полный title
      description,
      images: [fullImageUrl],
    },
  };
}
