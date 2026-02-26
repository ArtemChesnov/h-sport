import { queueEmail } from "@/modules/auth/lib/email-queue";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import {
  getIssueAndConfirmedEmails,
  markIssueSent,
  setUnsubscribeToken,
} from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

const UNSUBSCRIBE_PLACEHOLDER = "{{unsubscribe_link}}";
const SHOP_URL_PLACEHOLDER = "{{shop_url}}";
const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function replacePlaceholders(html: string, unsubscribeUrl: string, shopUrl: string): string {
  let out = html;
  if (out.includes(UNSUBSCRIBE_PLACEHOLDER)) {
    out = out.replace(new RegExp(UNSUBSCRIBE_PLACEHOLDER.replace(/[{}]/g, "\\$&"), "g"), unsubscribeUrl);
  }
  if (out.includes(SHOP_URL_PLACEHOLDER)) {
    out = out.replace(new RegExp(SHOP_URL_PLACEHOLDER.replace(/[{}]/g, "\\$&"), "g"), shopUrl);
  }
  return out;
}

/** Заменяет относительные src="/ и href="/ на абсолютные, чтобы ресурсы корректно открывались в письме */
function toAbsoluteUrls(html: string, origin: string): string {
  return html
    .replace(/\ssrc="\/(?!\/)/g, ` src="${origin}/`)
    .replace(/\shref="\/(?!\/)/g, ` href="${origin}/`);
}

type RouteContext = RouteParams<{ id: string }>;

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<ErrorResponse | { success: true; sentCount: number }>> {
  return withErrorHandling(
    async (req) => {
      const { requireAdmin } = await import("@/shared/lib/auth/middleware");
      const authError = await requireAdmin(req);
      if (authError) return authError as NextResponse<{ success: true; sentCount: number }>;

      const id = parseInt((await context.params).id, 10);
      if (Number.isNaN(id)) {
        return createErrorResponse("Некорректный ID", 400);
      }

      const data = await getIssueAndConfirmedEmails(id);
      if (!data) {
        return createErrorResponse("Выпуск не найден или уже отправлен", 404);
      }

      const { issue, subscribers } = data;
      if (subscribers.length === 0) {
        return createErrorResponse("Нет подтверждённых подписчиков для отправки", 400);
      }

      const origin = baseUrl();

      for (const sub of subscribers) {
        const token = await setUnsubscribeToken(sub.id);
        const unsubscribeUrl = `${origin}/api/shop/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
        let bodyHtml = replacePlaceholders(issue.bodyHtml, unsubscribeUrl, origin);
        bodyHtml = toAbsoluteUrls(bodyHtml, origin);
        queueEmail(sub.email, issue.subject, bodyHtml);
      }

      await markIssueSent(id);

      return NextResponse.json(
        { success: true as const, sentCount: subscribers.length },
        { status: 200 },
      );
    },
    request,
    "POST /api/admin/newsletter/issues/[id]/send",
  );
}
