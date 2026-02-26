
import type { Metadata } from "next";
import { PromosPageClient } from "./promos-page-client";

export const metadata: Metadata = {
  title: "Промокоды",
};

export default function PromosPage() {
  return <PromosPageClient />;
}
