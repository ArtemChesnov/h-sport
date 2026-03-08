/**
 * GET /api/assets/products/[...path]
 *
 * Отдаёт файлы из public/assets/images/products/ (каталог загрузок товаров).
 * Используется реврайтом из /assets/images/products/*, чтобы в standalone
 * раздавать файлы из process.cwd()/public/, а не из .next/standalone/public/.
 */

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

const PRODUCTS_IMAGES_DIR = "products";
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path: pathSegments } = await context.params;
  const segments = pathSegments ?? [];
  if (segments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const fileName = path.join(...segments);
  const baseDir = path.resolve(process.cwd(), "public", "assets", "images", PRODUCTS_IMAGES_DIR);
  const resolved = path.resolve(baseDir, fileName);

  if (!resolved.startsWith(baseDir) || resolved === baseDir) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const ext = path.extname(resolved).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const stat = await fs.stat(resolved);
    if (!stat.isFile()) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const body = await fs.readFile(resolved);
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === "ENOENT") {
      return new NextResponse("Not Found", { status: 404 });
    }
    throw err;
  }
}
