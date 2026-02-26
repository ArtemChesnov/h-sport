/**
 * GET/POST /api/metrics/incidents
 * Управление историей инцидентов. Только для администраторов.
 */

import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import {
  listIncidents,
  createOrUpdateIncident,
  type CreateIncidentInput,
} from "@/shared/services/server/metrics/metrics-route.service";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const CreateIncidentSchema = z.object({
  fingerprint: z.string().min(1, "Fingerprint обязателен"),
  source: z.string().min(1, "Source обязателен"),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  title: z.string().min(1, "Title обязателен").max(255, "Title слишком длинный"),
  message: z.string().min(1, "Message обязателен"),
});

export async function GET(request: NextRequest) {
  return withErrorHandling(
    async (req) => {
      const authError = await requireAdmin(req);
      if (authError) return authError;
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") as "ACTIVE" | "RESOLVED" | null;
      const severity = searchParams.get("severity") as "INFO" | "WARNING" | "CRITICAL" | null;
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);
      const result = await listIncidents({
        status: status ?? undefined,
        severity: severity ?? undefined,
        limit,
        offset,
      });
      return NextResponse.json(result, { status: 200 });
    },
    request,
    "GET /api/metrics/incidents",
  );
}

export async function POST(request: NextRequest) {
  return withErrorHandling(
    async (req) => {
      const authError = await requireAdmin(req);
      if (authError) return authError;
      const body = await req.json();
      const validatedData = CreateIncidentSchema.parse(body) as CreateIncidentInput;
      const { incident, created } = await createOrUpdateIncident(validatedData);
      return NextResponse.json(incident, { status: created ? 201 : 200 });
    },
    request,
    "POST /api/metrics/incidents",
  );
}
