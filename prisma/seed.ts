import { Prisma, PrismaClient } from "@prisma/client";
import { seedProducts } from "./seed-products";
import { seedUsers } from "./seed-users";
import { seedOrders } from "./seed-orders";
import { SeedProgress, createStep } from "./seed-progress";

export const prisma = new PrismaClient();

/** Сбрасывает sequence для Category.id в 0, чтобы после createMany id были 1, 2, … 13. Только PostgreSQL. */
async function resetCategorySequence(prismaInstance: PrismaClient) {
  try {
    await prismaInstance.$executeRaw(
      Prisma.sql`SELECT setval(pg_get_serial_sequence('"Category"', 'id'), 0)`
    );
  } catch {
    // SQLite или другая БД — игнорируем
  }
}

/**
 * Сидинг: один пользователь (админ), категории, товары из данных клиента.
 * Без липовых заказов, адресов, демо-корзин и лишних пользователей.
 */
async function up() {
  const progress = new SeedProgress([
    createStep("Пользователи", "👥", () => seedUsers(prisma)),

    createStep("Категории", "📁", async () => {
      await resetCategorySequence(prisma);
      await prisma.category.createMany({
        data: [
          { name: "Топы", slug: "tops" },
          { name: "Комплекты", slug: "top-leggings-sets" },
          { name: "Боди", slug: "bodysuits" },
          { name: "Майки и футболки", slug: "tanks-tees" },
          { name: "Лонгсливы", slug: "longsleeves" },
          { name: "Леггинсы", slug: "leggings" },
          { name: "Брюки", slug: "pants" },
          { name: "Шорты и велосипедки", slug: "shorts-bikers" },
          { name: "Шорты", slug: "shorts" },
          { name: "Юбки", slug: "skirts" },
          { name: "Платья и комбинезоны", slug: "dresses-jumpsuits" },
          { name: "Верхняя одежда", slug: "outerwear" },
          { name: "Аксессуары", slug: "accessories" },
        ],
        skipDuplicates: true,
      });
    }),

    createStep("Товары и варианты", "🛍️", () => seedProducts(prisma)),
    createStep("Заказы (только тестовый пользователь test@gmail.com)", "📦", () =>
      seedOrders(prisma)
    ),
  ]);

  await progress.execute();

  // Финальная статистика
  const categories = await prisma.category.findMany();
  const products = await prisma.product.count();
  const users = await prisma.user.count();
  const productItems = await prisma.productItem.count();

  const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
  };

  console.log(`${colors.cyan}${colors.bright}📈 Статистика базы данных:${colors.reset}\n`);
  console.log(
    `  ${colors.green}✓${colors.reset} Пользователи: ${colors.bright}${users}${colors.reset}`
  );
  console.log(
    `  ${colors.green}✓${colors.reset} Категории: ${colors.bright}${categories.length}${colors.reset}`
  );
  console.log(
    `  ${colors.green}✓${colors.reset} Товары: ${colors.bright}${products}${colors.reset}`
  );
  console.log(
    `  ${colors.green}✓${colors.reset} Варианты товаров: ${colors.bright}${productItems}${colors.reset}\n`
  );
}

/**
 * Полная очистка БД перед сидингом.
 * Важно: порядок удаления учитывает FK и onDelete.
 */
async function down() {
  const colors = {
    reset: "\x1b[0m",
    yellow: "\x1b[33m",
    dim: "\x1b[2m",
  };

  console.log(`${colors.yellow}🗑️  Очистка базы данных...${colors.reset}`);

  // Сначала всё, что жёстко завязано на Order
  await prisma.orderEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  // Потом корзины / избранное
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();

  // Метрики и логи
  await prisma.conversion.deleteMany();
  await prisma.favoriteAction.deleteMany();
  await prisma.cartAction.deleteMany();
  await prisma.productView.deleteMany();
  await prisma.apiMetric.deleteMany();
  await prisma.webVitalsMetric.deleteMany();
  await prisma.slowQuery.deleteMany();
  await prisma.serverMetrics.deleteMany();
  await prisma.securityEvent.deleteMany();
  await prisma.webhookLog.deleteMany();
  await prisma.clientErrorLog.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.newsletterIssue.deleteMany();

  // Товары и категории
  await prisma.productItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Промокоды, подписки, адреса
  await prisma.promoCode.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.address.deleteMany();

  // Пользователи и токены
  await prisma.user.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();

  console.log(`${colors.dim}✓ База данных очищена${colors.reset}\n`);
}

async function main() {
  try {
    await down();
    await up();
  } catch (error) {
    const colors = {
      reset: "\x1b[0m",
      red: "\x1b[31m",
      bright: "\x1b[1m",
    };
    console.error(`\n${colors.red}${colors.bright}❌ Ошибка при сидинге:${colors.reset}`);
    if (error instanceof Error) {
      console.error(`${colors.red}${error.message}${colors.reset}`);
      if (error.stack) {
        console.error(`${colors.red}${error.stack}${colors.reset}`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => process.exit(1));
