import { getAppUrl } from "@/shared/lib/config/env";
import { confirmByToken } from "@/shared/services/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shop/newsletter/confirm?token=...
 * Подтверждение подписки по ссылке из письма. Редирект на главную с query.
 */
export async function GET(request: NextRequest) {
  const baseUrl = getAppUrl();

  try {
    const token = request.nextUrl.searchParams.get("token") ?? "";
    const result = await confirmByToken(token);

    if (result.ok) {
      return NextResponse.redirect(`${baseUrl}/?newsletter=confirmed`);
    }

    return NextResponse.redirect(`${baseUrl}/?newsletter=confirm_error`);
  } catch (error) {
    const { logger } = await import("@/shared/lib/logger");
    logger.error("GET /api/shop/newsletter/confirm: Ошибка", error);
    return NextResponse.redirect(`${baseUrl}/?newsletter=confirm_error`);
  }
}
