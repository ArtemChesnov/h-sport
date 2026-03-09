/**
 * Очистка БД с сохранением товаров и категорий.
 * Удаляет: пользователей, токены, заказы, корзины, избранное, подписки, промокоды,
 * метрики, логи и т.д. Категории, товары (Product) и варианты (ProductItem) не трогаем.
 *
 * Локально:
 *   npm run db:clean-keep-products
 *   или: npx ts-node --project tsconfig.seed.json scripts/clean-db-keep-products.ts
 *
 * На сервере (используется DATABASE_URL из .env в каталоге проекта):
 *   cd /home/deploy/h-sport   # или ваш DEPLOY_PATH
 *   [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
 *   npm run db:clean-keep-products
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDbKeepProducts() {
  const colors = { reset: "\x1b[0m", yellow: "\x1b[33m", green: "\x1b[32m", dim: "\x1b[2m" };

  console.log(
    `${colors.yellow}🗑️  Очистка БД (категории и товары сохраняются)...${colors.reset}\n`
  );

  // Порядок учитывает FK и onDelete

  await prisma.orderEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();

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

  // Не удаляем: ProductItem, Product, Category

  await prisma.promoCode.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();

  const categories = await prisma.category.count();
  const products = await prisma.product.count();
  const productItems = await prisma.productItem.count();

  console.log(`${colors.dim}✓ Очистка завершена.${colors.reset}`);
  console.log(
    `${colors.green}✓ Сохранено:${colors.reset} категорий ${categories}, товаров ${products}, вариантов ${productItems}\n`
  );
}

cleanDbKeepProducts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
