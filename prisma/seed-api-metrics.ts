import { PrismaClient } from "@prisma/client";

/**
 * Хелпер для получения случайной даты в диапазоне
 */
function randomDate(daysAgoStart: number, daysAgoEnd: number): Date {
  const now = new Date();
  const start = new Date(now.getTime() - daysAgoStart * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() - daysAgoEnd * 24 * 60 * 60 * 1000);
  const diff = end.getTime() - start.getTime();
  return new Date(start.getTime() + Math.random() * diff);
}

/**
 * Сидинг API метрик для тестирования страницы /admin/metrics
 */
export async function seedApiMetrics(prisma: PrismaClient) {
  // Эндпоинты для тестирования
  const endpoints = [
    "/api/shop/products",
    "/api/shop/products/[slug]",
    "/api/shop/categories",
    "/api/admin/products",
    "/api/admin/orders",
    "/api/admin/users",
    "/api/admin/dashboard",
    "/api/auth/signin",
    "/api/auth/signup",
    "/api/cart",
    "/api/favorites",
    "/api/checkout",
    "/api/health",
  ];

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const statusCodes = [200, 201, 400, 401, 404, 500];
  const statusCodeWeights = {
    200: 70, // 70% успешных запросов
    201: 10,
    400: 8,
    401: 3,
    404: 5,
    500: 4,
  };

  // Генерируем метрики за последние 7 дней
  const metrics = [];

  for (let i = 0; i < 500; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const method = endpoint === "/api/shop/products"
      ? "GET"
      : endpoint.includes("/api/admin")
        ? methods[Math.floor(Math.random() * 3)] // GET, POST, PUT
        : methods[Math.floor(Math.random() * methods.length)];

    // Выбираем статус код на основе весов
    const rand = Math.random() * 100;
    let statusCode = 200;
    let cumulative = 0;
    for (const [code, weight] of Object.entries(statusCodeWeights)) {
      cumulative += weight;
      if (rand <= cumulative) {
        statusCode = parseInt(code);
        break;
      }
    }

    // Длительность запроса (в миллисекундах)
    let duration = 50 + Math.random() * 200; // 50-250ms для большинства
    if (statusCode >= 400) {
      duration += Math.random() * 300; // Ошибки могут быть медленнее
    }
    if (endpoint.includes("dashboard") || endpoint.includes("products")) {
      duration += Math.random() * 500; // Эти эндпоинты могут быть медленнее
    }
    duration = Math.floor(duration);

    const daysAgo = Math.random() * 7; // За последние 7 дней

    metrics.push({
      endpoint,
      method,
      duration,
      statusCode,
      createdAt: randomDate(daysAgo, daysAgo - 0.01),
    });
  }

  // Добавляем несколько медленных запросов для тестирования
  for (let i = 0; i < 20; i++) {
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    metrics.push({
      endpoint,
      method: "GET",
      duration: 1000 + Math.random() * 2000, // 1-3 секунды
      statusCode: 200,
      createdAt: randomDate(Math.random() * 7, 0),
    });
  }

  await prisma.apiMetric.createMany({
    data: metrics,
    skipDuplicates: true,
  });

  console.log(`[seedApiMetrics] Создано API метрик: ${metrics.length}`);
}
