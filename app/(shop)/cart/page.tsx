import { CART_LABELS } from "@/shared/constants";
import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import { Metadata } from "next";
import CartPageClient from "./cart-page-client";

export const metadata: Metadata = generateSEOMetadata({
  title: CART_LABELS.title,
  description: "Ваша корзина покупок в H-Sport",
  url: "/cart",
});

export default function CartPage() {
  return <CartPageClient />;
}
