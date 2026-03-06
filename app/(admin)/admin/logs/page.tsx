import type { Metadata } from "next";
import { Separator } from "@/shared/components/ui/separator";
import { LogsPageClient } from "./_components/logs-page-client";

export const metadata: Metadata = {
  title: "Логи",
  description: "События безопасности, клиентские ошибки и входящие webhook'и",
};

export default function AdminLogsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-12 sm:pt-14 md:p-8 md:pt-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Логи</h1>
        <p className="text-sm text-muted-foreground mt-1">
          События безопасности, клиентские ошибки и входящие webhook&apos;и
        </p>
      </header>
      <Separator />
      <LogsPageClient />
    </div>
  );
}
