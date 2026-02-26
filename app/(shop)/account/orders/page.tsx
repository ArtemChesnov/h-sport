
import type { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import { OrdersPageClient } from "./orders-page-client";

export const metadata: Metadata = generateSEOMetadata({
  title: "Мои заказы",
  description: "История ваших заказов в H-Sport",
  url: "/account/orders",
});

export default function OrdersPage() {
  return <OrdersPageClient />;
}
