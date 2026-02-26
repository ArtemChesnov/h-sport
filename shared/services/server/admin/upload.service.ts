/** Загрузка файлов: валидация типа/размера, сохранение, UPLOAD_CONFIG. */

import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";

// Константы валидации
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB на файл
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB суммарно
  MAX_FILES_COUNT: 20,
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"],
} as const;

// Magic bytes для проверки реального типа файла
const FILE_SIGNATURES: Record<string, number[][]> = {
  ".jpg": [[0xff, 0xd8, 0xff]],
  ".jpeg": [[0xff, 0xd8, 0xff]],
  ".png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  ".webp": [[0x52, 0x49, 0x46, 0x46], [0x57, 0x45, 0x42, 0x50]],
  ".avif": [[0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]],
};

/** Результат загрузки */
export type UploadResult =
  | { ok: true; paths: string[] }
  | { ok: false; message: string };

/** Параметры загрузки */
export interface UploadParams {
  folder: string;
  productName?: string;
  color?: string;
  sku?: string;
}

/**
 * Проверка реального типа файла по magic bytes
 */
export function validateFileType(buffer: Buffer, expectedExt: string): boolean {
  const signatures = FILE_SIGNATURES[expectedExt];
  if (!signatures) return false;

  for (const signature of signatures) {
    let matches = true;
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }
  return false;
}

/**
 * Санитизация имени папки - защита от path traversal
 */
export function sanitizeFolderName(folder: string): string {
  const sanitized = folder.replace(/[^a-z0-9_-]/gi, "").toLowerCase();
  return sanitized.slice(0, 50) || "products";
}

/**
 * Транслитерация ru -> lat + нормализация для имени файла
 */
export function slugifyRu(value: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
    ы: "y", э: "e", ю: "yu", я: "ya",
  };

  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((ch) => {
      const lower = ch.toLowerCase();
      if (map[lower]) return map[lower];
      if (/[a-z0-9]/.test(lower)) return lower;
      if (/\s|-/.test(lower)) return "-";
      return "";
    })
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Валидирует файл перед загрузкой
 */
export function validateFile(
  file: File,
  buffer: Buffer,
  currentTotalSize: number,
): { ok: true } | { ok: false; message: string } {
  // Проверка размера файла
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      ok: false,
      message: `Файл "${file.name}" слишком большой. Максимум ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (currentTotalSize + file.size > UPLOAD_CONFIG.MAX_TOTAL_SIZE) {
    return {
      ok: false,
      message: `Общий размер файлов превышает ${UPLOAD_CONFIG.MAX_TOTAL_SIZE / 1024 / 1024}MB`,
    };
  }

  const ext = path.extname(file.name || "image").toLowerCase();

  if (!UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(ext as typeof UPLOAD_CONFIG.ALLOWED_EXTENSIONS[number])) {
    return {
      ok: false,
      message: `Неподдерживаемый формат "${file.name}". Разрешены: ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  const mimeType = file.type?.toLowerCase();
  if (mimeType && !UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType as typeof UPLOAD_CONFIG.ALLOWED_MIME_TYPES[number])) {
    return { ok: false, message: `Неподдерживаемый MIME-тип файла "${file.name}"` };
  }

  if (!validateFileType(buffer, ext)) {
    return { ok: false, message: `Файл "${file.name}" не соответствует заявленному формату` };
  }

  return { ok: true };
}

/**
 * Загружает файлы на диск
 */
export async function uploadFiles(
  files: File[],
  params: UploadParams,
  basePath: string,
): Promise<UploadResult> {
  if (!files || files.length === 0) {
    return { ok: false, message: "Файлы не переданы" };
  }

  if (files.length > UPLOAD_CONFIG.MAX_FILES_COUNT) {
    return { ok: false, message: `Максимум ${UPLOAD_CONFIG.MAX_FILES_COUNT} файлов за раз` };
  }

  const folder = sanitizeFolderName(params.folder);
  const uploadDir = path.join(basePath, "public", "assets", "images", folder);

  // Проверка path traversal
  const resolvedPath = path.resolve(uploadDir);
  const publicBasePath = path.resolve(basePath, "public", "assets", "images");
  if (!resolvedPath.startsWith(publicBasePath)) {
    return { ok: false, message: "Некорректный путь для загрузки" };
  }

  await fs.mkdir(uploadDir, { recursive: true });

  // Генерация префикса
  const productPart = params.productName ? slugifyRu(params.productName) : "product";
  const colorPart = params.color ? slugifyRu(params.color) : "color";
  const skuPart = params.sku ? slugifyRu(params.sku) : "sku";
  const basePrefix = `${productPart}_${colorPart}_${skuPart}`.slice(0, 100);

  const savedPaths: string[] = [];
  let totalSize = 0;

  for (const [index, file] of files.entries()) {
    if (!(file instanceof File)) continue;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const validation = validateFile(file, buffer, totalSize);
    if (!validation.ok) {
      return validation;
    }

    totalSize += file.size;

    const ext = path.extname(file.name || "image").toLowerCase();
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const finalName = `${basePrefix}-${index + 1}-${randomSuffix}${ext}`;
    const filePath = path.join(uploadDir, finalName);

    try {
      await fs.access(filePath);
      // Файл существует, генерируем новое имя
      const retrySuffix = crypto.randomBytes(4).toString("hex");
      const retryName = `${basePrefix}-${index + 1}-${retrySuffix}${ext}`;
      const retryPath = path.join(uploadDir, retryName);
      await fs.writeFile(retryPath, buffer);
      savedPaths.push(`/assets/images/${folder}/${retryName}`);
    } catch {
      await fs.writeFile(filePath, buffer);
      savedPaths.push(`/assets/images/${folder}/${finalName}`);
    }
  }

  if (savedPaths.length === 0) {
    return { ok: false, message: "Не удалось обработать ни одного файла" };
  }

  return { ok: true, paths: savedPaths };
}
