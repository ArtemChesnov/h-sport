import { Metadata } from "next";
import { DashboardContent } from "./components/dashboard-content";

export const metadata: Metadata = {
  title: "Мониторинг | H-Sport Admin",
  description: "Дашборд мониторинга производительности и бизнеса",
};

export default function MonitoringDashboardPage() {
  return <DashboardContent />;
}
