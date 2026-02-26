import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { requireAdmin } from "@/shared/lib/auth/middleware";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

async function postHandler(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  revalidatePath("/", "layout");
  revalidatePath("/catalog", "page");
  revalidatePath("/product/[slug]", "page");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(postHandler, request, "POST /api/admin/revalidate");
}
