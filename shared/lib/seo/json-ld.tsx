/**
 * Генерация структурированных данных (JSON-LD) для SEO
 */

/**
 * Структурированные данные для товара (Product)
 */
export interface ProductJsonLd {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: "RUB";
    availability: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
    url?: string;
  };
  brand?: {
    "@type": "Brand";
    name: string;
  };
  category?: string;
}

/**
 * Структурированные данные для организации (Organization)
 */
export interface OrganizationJsonLd {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

/**
 * Структурированные данные для хлебных крошек (BreadcrumbList)
 */
export interface BreadcrumbJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Создает JSON-LD для товара
 */
export function createProductJsonLd(data: {
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  price: number; // в копейках
  currency?: string;
  availability?: boolean;
  url?: string;
  brand?: string;
  category?: string;
}): ProductJsonLd {
  const priceInRubles = (data.price / 100).toFixed(2);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    ...(data.description && { description: data.description }),
    ...(data.image && { image: data.image }),
    ...(data.sku && { sku: data.sku }),
    offers: {
      "@type": "Offer",
      price: priceInRubles,
      priceCurrency: (data.currency || "RUB") as "RUB",
      availability: data.availability !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      ...(data.url && { url: data.url }),
    },
    ...(data.brand && {
      brand: {
        "@type": "Brand",
        name: data.brand,
      },
    }),
    ...(data.category && { category: data.category }),
  };
}

/**
 * Создает JSON-LD для организации
 */
export function createOrganizationJsonLd(data: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}): OrganizationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    ...(data.logo && { logo: data.logo }),
    ...(data.description && { description: data.description }),
  };
}

/**
 * Создает JSON-LD для хлебных крошек
 */
export function createBreadcrumbJsonLd(items: Array<{ name: string; url: string }>): BreadcrumbJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Компонент для вставки JSON-LD в страницу
 */
import React from "react";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
