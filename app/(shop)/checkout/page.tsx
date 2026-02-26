/**
 * Страница оформления заказа - адрес доставки
 */

import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import CheckoutPageClient from "./checkout-page-client";

export const metadata: Metadata = generateSEOMetadata({
  title: "Оформление заказа",
  description: "Оформление заказа в H-Sport",
  url: "/checkout",
});

export default function CheckoutAddressPage() {
  return <CheckoutPageClient />;
}
