import { createOrganizationJsonLd, JsonLd } from "@/shared/lib/seo/json-ld";
import { env } from "@/shared/lib/env.client";
import type { Metadata, Viewport } from "next";
import { inter, nunitoSans, oswald } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";

const siteUrl = env.appUrl;
const defaultOgImage = `${siteUrl}/logo-icon.png`;
const organizationJsonLd = createOrganizationJsonLd({
  name: "H-Sport",
  url: siteUrl,
  logo: defaultOgImage,
  description: "Магазин спортивной одежды для активного образа жизни. Широкий выбор, быстрая доставка по России.",
});

export const metadata: Metadata = {
  title: {
    default: "H-Sport — Магазин спортивной одежды",
    template: "%s | H-Sport",
  },
  description: "Качественная спортивная одежда для активного образа жизни. Широкий выбор, быстрая доставка по России.",
  keywords: ["спортивная одежда", "фитнес", "спорт", "одежда для тренировок", "H-Sport"],
  authors: [{ name: "H-Sport" }],
  creator: "H-Sport",
  publisher: "H-Sport",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "H-Sport",
    title: "H-Sport — Магазин спортивной одежды",
    description: "Качественная спортивная одежда для активного образа жизни",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: "H-Sport" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "H-Sport — Магазин спортивной одежды",
    description: "Качественная спортивная одежда для активного образа жизни",
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#EB6081",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`bg-secondary ${oswald.variable} ${nunitoSans.variable} ${inter.variable}`}
    >
      <head>
        <JsonLd data={organizationJsonLd} />
        <link data-rh="true" rel="icon" href="/logo-icon.png" />
        {/* Preconnect к API — только если API на внешнем домене */}
        {env.apiUrl.startsWith("http") && <link rel="preconnect" href={env.apiUrl} />}
      </head>

      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
