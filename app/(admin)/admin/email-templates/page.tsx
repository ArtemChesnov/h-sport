/**
 * Страница превью шаблонов писем — для правки вёрстки.
 * Шаблоны рендерятся в iframe из API (те же структуры, что уходят на почту).
 */

import { EmailTemplatesClient } from "./email-templates-client";

const TEMPLATES: { id: string; label: string }[] = [
  { id: "verification", label: "Подтверждение email" },
  { id: "password-reset", label: "Сброс пароля" },
  { id: "newsletter", label: "Подтверждение подписки на рассылку" },
  { id: "order", label: "Заказ оформлен" },
  { id: "order-status", label: "Изменение статуса заказа" },
];

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Шаблоны писем
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Превью для правки вёрстки. Исходники: <code className="rounded bg-muted px-1 py-0.5 text-xs">app/api/admin/email-templates/preview/route.ts</code>, стили: <code className="rounded bg-muted px-1 py-0.5 text-xs">shared/lib/email-responsive-styles.ts</code>
        </p>
      </div>
      <EmailTemplatesClient templates={TEMPLATES} />
    </div>
  );
}
