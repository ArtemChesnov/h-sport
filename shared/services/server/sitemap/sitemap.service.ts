/**
 * Server service: sitemap entries (products, categories, static).
 */

import { prisma } from "@/prisma/prisma-client";
import { SITEMAP_CATEGORIES_MAX, SITEMAP_PRODUCTS_PAGE_SIZE } from "@/shared/constants";
import type { MetadataRoute } from "next";

export type SitemapEntry = MetadataRoute.Sitemap[number];

/**
 * Returns full sitemap entries for the given base URL.
 * Uses pagination for products and limit for categories.
 */
export async function getSitemapEntries(baseUrl: string): Promise<SitemapEntry[]> {
  const staticPages: SitemapEntry[] = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/catalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/cart`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/showroom`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/payment-delivery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/sales-rules`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/favorites`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  const productWhere = {
    items: { some: { isAvailable: true } },
  };

  const productPages: SitemapEntry[] = [];
  let skip = 0;
  let chunk: Array<{ slug: string; updatedAt: Date }>;

  do {
    chunk = await prisma.product.findMany({
      where: productWhere,
      select: { slug: true, updatedAt: true },
      orderBy: { id: "asc" },
      skip,
      take: SITEMAP_PRODUCTS_PAGE_SIZE,
    });
    for (const product of chunk) {
      productPages.push({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }
    skip += chunk.length;
  } while (chunk.length === SITEMAP_PRODUCTS_PAGE_SIZE);

  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { id: "asc" },
    take: SITEMAP_CATEGORIES_MAX,
  });

  const categoryPages: SitemapEntry[] = categories.map((category) => ({
    url: `${baseUrl}/catalog?categorySlug=${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
