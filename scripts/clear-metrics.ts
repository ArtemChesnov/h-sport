/**
 * Скрипт для очистки API метрик и Web Vitals метрик
 */

import { prisma } from "../prisma/prisma-client";

async function clearMetrics() {
  console.log("🧹 Очистка API метрик и Web Vitals метрик...\n");

  try {
    // Удаляем API метрики
    const apiMetricsCount = await prisma.apiMetric.count();
    await prisma.apiMetric.deleteMany({});
    console.log(`✅ Удалено API метрик: ${apiMetricsCount}`);

    // Удаляем Web Vitals метрики
    const webVitalsCount = await prisma.webVitalsMetric.count();
    await prisma.webVitalsMetric.deleteMany({});
    console.log(`✅ Удалено Web Vitals метрик: ${webVitalsCount}`);

    console.log("\n✨ Очистка завершена успешно!");
  } catch (error) {
    console.error("❌ Ошибка при очистке метрик:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearMetrics();
