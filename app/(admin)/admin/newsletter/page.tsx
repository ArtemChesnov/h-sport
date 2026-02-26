import type { Metadata } from "next";
import { NewsletterPageClient } from "./newsletter-page-client";

export const metadata: Metadata = {
  title: "Рассылки",
  description: "Подписчики и выпуски рассылки новостей",
};

export default function AdminNewsletterPage() {
  return <NewsletterPageClient />;
}
