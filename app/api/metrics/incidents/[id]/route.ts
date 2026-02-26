/**
 * PATCH /api/metrics/incidents/[id]
 * Обновление статуса инцидента. Только для администраторов.
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { getIncidentById, updateIncidentStatus } from "@/shared/services/server/metrics/metrics-route.service";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const UpdateIncidentSchema = z.object({
  status: z.enum(["ACTIVE", "RESOLVED"]).optional(),
});

async function handler(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();
  if (!id) return createErrorResponse("Неверный ID инцидента", 400);

  const incidentId = parseInt(id, 10);
  if (isNaN(incidentId)) return createErrorResponse("Неверный ID инцидента", 400);

  const existing = await getIncidentById(incidentId);
  if (!existing) return createErrorResponse("Инцидент не найден", 404);

  const body = await request.json();
  const validatedData = UpdateIncidentSchema.parse(body);

  if (!validatedData.status) {
    return createErrorResponse("Неверные данные для обновления", 400);
  }

  const updatedIncident = await updateIncidentStatus(incidentId, validatedData.status);
  return NextResponse.json(updatedIncident, { status: 200 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse<unknown>> {
  return withErrorHandling(handler, request, "PATCH /api/metrics/incidents/[id]");
}
