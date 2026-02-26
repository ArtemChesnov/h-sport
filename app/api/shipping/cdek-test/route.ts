/**
 * GET /api/shipping/cdek-test
 *
 * Проверка подключения к API СДЭК: токен, поиск города, список ПВЗ.
 * Использует CDEK_CLIENT_ID, CDEK_CLIENT_SECRET, CDEK_IS_TEST из .env.
 */

import { findCDEKCity, getCDEKPickupPoints } from "@/modules/shipping/lib/pickupPoints/providers/cdek";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.CDEK_CLIENT_ID;
  const clientSecret = process.env.CDEK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "CDEK credentials not configured",
        hint: "Add CDEK_CLIENT_ID and CDEK_CLIENT_SECRET to .env",
      },
      { status: 503 },
    );
  }

  try {
    const isTest = process.env.CDEK_IS_TEST === "true";
    const baseUrl = isTest ? "https://api.edu.cdek.ru" : "https://api.cdek.ru";

    // 1) Получение токена (вызов getCDEKPickupPoints или findCDEKCity подтянет токен внутри)
    const testCityName = "Москва";
    const cityCode = await findCDEKCity(testCityName);

    if (!cityCode) {
      return NextResponse.json({
        ok: true,
        message: "CDEK API доступен, токен получен",
        baseUrl,
        testCity: testCityName,
        cityCode: null,
        hint: "Город не найден в тестовой базе СДЭК (api.edu.cdek.ru). Попробуйте другой город в основном API (CDEK_IS_TEST=false).",
      });
    }

    // 2) Получение ПВЗ по коду города
    const points = await getCDEKPickupPoints(cityCode, undefined, undefined, undefined, 5);

    return NextResponse.json({
      ok: true,
      message: "CDEK API работает",
      baseUrl,
      testCity: testCityName,
      cityCode,
      pointsCount: points.length,
      samplePoints: points.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        type: p.type,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        message: "CDEK API error",
        error: message,
      },
      { status: 500 },
    );
  }
}
