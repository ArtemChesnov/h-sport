/**
 * Очистка таблиц метрик перед деплоем.
 * Запуск: npx ts-node --project tsconfig.seed.json scripts/clear-metrics.ts
 */

import { prisma } from "../prisma/prisma-client";

async function main() {
  const [api, webVitals, slowQuery, server] = await Promise.all([
    prisma.apiMetric.deleteMany(),
    prisma.webVitalsMetric.deleteMany(),
    prisma.slowQuery.deleteMany(),
    prisma.serverMetrics.deleteMany(),
  ]);

  console.log("Очищено:");
  console.log("  ApiMetric:", api.count);
  console.log("  WebVitalsMetric:", webVitals.count);
  console.log("  SlowQuery:", slowQuery.count);
  console.log("  ServerMetrics:", server.count);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
