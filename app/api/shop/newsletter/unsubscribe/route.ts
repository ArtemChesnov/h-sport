import { unsubscribeByToken } from "@/shared/services/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shop/newsletter/unsubscribe?token=...
 * Отписка по ссылке из письма (персональный токен выдаётся при отправке рассылки). Редирект на главную с query.
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const token = request.nextUrl.searchParams.get("token") ?? "";
    const result = await unsubscribeByToken(token);

    if (result.ok) {
      return NextResponse.redirect(`${baseUrl}/?newsletter=unsubscribed`);
    }

    return NextResponse.redirect(`${baseUrl}/?newsletter=unsubscribe_error`);
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("GET /api/shop/newsletter/unsubscribe: Ошибка", error);
    return NextResponse.redirect(`${baseUrl}/?newsletter=unsubscribe_error`);
  }
}
