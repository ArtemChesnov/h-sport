import { validateRequestSize, withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { uploadFiles } from "@/shared/services/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UploadResponse = { paths: string[] } | { message: string; error?: string };

async function postHandler(
  request: NextRequest,
): Promise<NextResponse<UploadResponse>> {
  const { applyRateLimit } = await import("@/shared/lib/api/rate-limit-middleware");
  const rateLimitResponse = await applyRateLimit(request, "upload");
  if (rateLimitResponse) return rateLimitResponse as NextResponse<UploadResponse>;

  const { requireAdmin } = await import("@/shared/lib/auth/middleware");
  const authError = await requireAdmin(request);
  if (authError) return authError as NextResponse<UploadResponse>;

  const sizeCheck = validateRequestSize(request, 50 * 1024 * 1024);
  if (!sizeCheck.valid) return sizeCheck.response as NextResponse<UploadResponse>;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return createErrorResponse("Некорректный формат запроса", 400) as NextResponse<UploadResponse>;
  }

  const files = formData.getAll("files") as File[];

  const result = await uploadFiles(files, {
    folder: (formData.get("folder") as string) || "products",
    productName: (formData.get("productName") as string) || "",
    color: (formData.get("color") as string) || "",
    sku: (formData.get("sku") as string) || "",
  }, process.cwd());

  if (!result.ok) {
    return NextResponse.json<UploadResponse>({ message: result.message }, { status: 400 });
  }

  return NextResponse.json<UploadResponse>({ paths: result.paths }, { status: 200 });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandler, request, "POST /api/admin/upload");
}
