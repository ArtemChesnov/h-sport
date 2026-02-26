
import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import FavoritesPageClient from "./favorites-page-client";

export const metadata: Metadata = generateSEOMetadata({
  title: "Избранное",
  description: "Избранные товары в H-Sport",
  url: "/favorites",
});

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
