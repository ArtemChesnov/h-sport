import type { Metadata } from "next";
import { OrdersPageClient } from "./orders-page-client";

export const metadata: Metadata = {
  title: "Заказы",
};

export default function AdminOrdersPage() {
  return <OrdersPageClient />;
}
