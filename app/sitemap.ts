/**
 * Генерация sitemap.xml для SEO.
 * Данные получает через server-service (без прямого prisma в app).
 */

import { getAppUrl } from "@/shared/lib/config/env";
import { getSitemapEntries } from "@/shared/services/server/sitemap/sitemap.service";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl();

  if (!process.env.DATABASE_URL) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/catalog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];
  }

  try {
    return await getSitemapEntries(baseUrl);
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("Error generating sitemap", error);
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      {
        url: `${baseUrl}/catalog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];
  }
}
