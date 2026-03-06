"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { SecurityLogsTab } from "./security-logs-tab";
import { ClientErrorsTab } from "./client-errors-tab";
import { WebhooksTab } from "./webhooks-tab";

export function LogsPageClient() {
  return (
    <Tabs defaultValue="security" className="w-full">
      <TabsList className="grid w-full max-w-2xl grid-cols-3">
        <TabsTrigger value="security">Безопасность</TabsTrigger>
        <TabsTrigger value="client-errors">Клиентские ошибки</TabsTrigger>
        <TabsTrigger value="webhooks">Webhook&apos;и</TabsTrigger>
      </TabsList>
      <TabsContent value="security" className="mt-6">
        <SecurityLogsTab />
      </TabsContent>
      <TabsContent value="client-errors" className="mt-6">
        <ClientErrorsTab />
      </TabsContent>
      <TabsContent value="webhooks" className="mt-6">
        <WebhooksTab />
      </TabsContent>
    </Tabs>
  );
}
