
import type { Metadata } from "next";
import { DashboardPageClient } from "./dashboard-page-client";

export const metadata: Metadata = {
  title: "Главная",
};

export default function AdminDashboardPage() {
  return <DashboardPageClient />;
}
