import { calculateCDEKTariff } from "@/modules/shipping/lib/pickupPoints/providers/cdek";
import { calculateRussianPostTariff } from "@/modules/shipping/lib/pickupPoints/providers/russianpost";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  city: z.string().min(1),
  method: z.enum(["CDEK_PVZ", "CDEK_COURIER", "POCHTA_PVZ", "POCHTA_COURIER"]),
  valuationRub: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
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

  const { city, method, valuationRub } = validation.data;

  if (method === "CDEK_PVZ" || method === "CDEK_COURIER") {
    const mode = method === "CDEK_PVZ" ? "pvz" : "courier";
    const result = await calculateCDEKTariff(city, mode);
    if (!result) {
      return NextResponse.json({
        deliveryCostKopecks: null,
        periodMin: null,
        periodMax: null,
        message: "Не удалось рассчитать стоимость доставки СДЭК",
      });
    }
    return NextResponse.json({
      deliveryCostKopecks: result.deliverySum,
      periodMin: result.periodMin,
      periodMax: result.periodMax,
      tariffName: result.tariffName,
    });
  }

  if (method === "POCHTA_PVZ" || method === "POCHTA_COURIER") {
    const mode = method === "POCHTA_PVZ" ? "pvz" : "courier";
    const result = await calculateRussianPostTariff(
      city,
      mode,
      1000,
      valuationRub ?? 1000,
    );
    if (!result) {
      return NextResponse.json({
        deliveryCostKopecks: null,
        periodMin: null,
        periodMax: null,
        message: "Не удалось рассчитать стоимость доставки Почты России",
      });
    }
    return NextResponse.json({
      deliveryCostKopecks: result.deliverySum,
      periodMin: result.periodMin,
      periodMax: result.periodMax,
      tariffName: result.tariffName,
    });
  }

  return NextResponse.json(
    { message: "Unknown delivery method", deliveryCostKopecks: null },
    { status: 400 },
  );
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/shipping/calculate-delivery");
}
