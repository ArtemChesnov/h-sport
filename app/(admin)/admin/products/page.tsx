
import type { Metadata } from "next";
import { ProductsPageClient } from "./products-page-client";

export const metadata: Metadata = {
  title: "Товары",
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
