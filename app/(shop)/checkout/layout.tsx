import type { Metadata } from "next";
import { CheckoutLayoutClient } from "./checkout-layout-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutLayoutClient>{children}</CheckoutLayoutClient>;
}
