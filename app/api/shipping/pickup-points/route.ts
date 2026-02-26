import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getPickupPoints } from "@/modules/shipping/lib/pickupPoints";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  provider: z.enum(["cdek", "russianpost"]),
  city: z.string().optional(),
  cityCode: z.string().optional(),
  q: z.string().optional(),
  lat: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
  lon: z.string().transform((val) => (val ? parseFloat(val) : undefined)).optional(),
  limit: z.string().transform((val) => (val ? parseInt(val, 10) : undefined)).optional(),
});

async function getHandler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const rawQuery = Object.fromEntries(searchParams.entries());
  const validation = querySchema.safeParse(rawQuery);

  if (!validation.success) {
    return NextResponse.json(
      { message: "Invalid query parameters", errors: validation.error.issues },
      { status: 400 },
    );
  }

  const query = validation.data;

  const hasCity = !!query.city;
  const hasCityCode = !!query.cityCode;
  const hasCoordinates = !!(query.lat && query.lon);

  if (!hasCity && !hasCityCode && !hasCoordinates) {
    return NextResponse.json(
      { message: "Должен быть указан хотя бы один параметр: city, cityCode или lat+lon" },
      { status: 400 },
    );
  }

  if (query.q && query.q.length > 200) {
    query.q = query.q.slice(0, 200);
  }
  if (query.city && query.city.length > 200) {
    query.city = query.city.slice(0, 200);
  }

  try {
    const points = await getPickupPoints({
      provider: query.provider,
      city: query.city,
      cityCode: query.cityCode,
      q: query.q,
      lat: query.lat,
      lon: query.lon,
      limit: query.limit || 50,
    });

    return NextResponse.json({ points });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("CDEK credentials not configured")) {
      return NextResponse.json(
        {
          message: "CDEK credentials not configured",
          error: "Для работы СДЭК ПВЗ необходим договор и API ключи. Обратитесь к администратору.",
          points: [],
        },
        { status: 503 },
      );
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/shipping/pickup-points");
}
