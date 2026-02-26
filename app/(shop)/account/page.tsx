
import { Metadata } from "next";
import { generateMetadata as generateSEOMetadata } from "@/shared/lib/seo";
import AccountPageClient from "./account-page-client";

export const metadata: Metadata = generateSEOMetadata({
  title: "Личный кабинет",
  description: "Личный кабинет пользователя H-Sport",
  url: "/account",
});

export default function AccountPage() {
  return <AccountPageClient />;
}
