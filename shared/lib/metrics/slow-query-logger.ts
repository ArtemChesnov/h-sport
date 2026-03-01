/**
 * Логирование медленных запросов к БД.
 * ВАЖНО: логируем ТОЛЬКО в консоль/файл через logger, НЕ в БД.
 */

import { logger } from "../logger";

const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || "1000", 10);

function normalizeQuery(query: string): string {
  let normalized = query.replace(/\s+/g, " ").trim();
  if (normalized.length > 500) {
    normalized = normalized.substring(0, 500) + "...";
  }
  return normalized;
}

const IGNORED_QUERY_PATTERNS = [/^\s*SELECT\s+1\s*$/i, /^\s*COMMIT\s*$/i];

export async function logSlowQuery(params: {
  query: string;
  duration: number;
  endpoint?: string;
  userId?: string;
}): Promise<void> {
  const normalizedQuery = normalizeQuery(params.query);
  const isIgnored = IGNORED_QUERY_PATTERNS.some((re) => re.test(normalizedQuery));
  if (isIgnored) return;

  logger.warn("[SlowQuery] Slow database query detected", {
    query: normalizedQuery,
    duration: params.duration,
    endpoint: params.endpoint || undefined,
    userId: params.userId || undefined,
  });
}

export function getSlowQueryThreshold(): number {
  return SLOW_QUERY_THRESHOLD_MS;
}
