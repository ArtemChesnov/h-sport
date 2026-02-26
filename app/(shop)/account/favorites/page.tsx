import type { Metadata } from "next";
import { FavoritesPageClient } from "./favorites-page-client";

export const metadata: Metadata = {
  title: "Избранное",
  description: "Ваши избранные товары",
};

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
