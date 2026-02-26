/**
 * Layout для секции личного кабинета.
 * Сайдбар и оболочка контента вынесены сюда — не перерендериваются при смене вкладок.
 */
import type { Metadata } from "next";
import { AccountLayoutClient } from "./account-layout-client";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayoutClient>{children}</AccountLayoutClient>;
}
