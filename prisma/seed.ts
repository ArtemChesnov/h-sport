
import { PrismaClient } from "@prisma/client";
import { seedAddresses } from "./seed-addresses";
import { seedOrders } from "./seed-orders";
import { seedProducts } from "./seed-products";
import { seedUsers } from "./seed-users";
import { SeedProgress, createStep } from "./seed-progress";

export const prisma = new PrismaClient();

/**
 * Основной сидинг:
 * - пользователи
 * - категории
 * - товары (+ варианты)
 * - демо-корзины + избранное
 * - подписки
 * - промокоды
 * - тестовые заказы (для дашборда и раздела /(admin)/orders)
 */
async function up() {
  const progress = new SeedProgress([
    createStep("Пользователи", "👥", () => seedUsers(prisma)),

    createStep("Категории", "📁", async () => {
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

    createStep("Тестовые заказы", "📦", () => seedOrders(prisma)),

    createStep("Корзины и избранное", "🛒", () => seedDemoCartsAndFavorites(prisma)),

    createStep("Подписки", "📧", () => seedDemoSubscriptions(prisma)),

    createStep("Промокоды", "🎫", () => seedPromoCodes(prisma)),

    createStep("Адреса", "📍", () => seedAddresses(prisma)),
  ]);

  await progress.execute();

  // Финальная статистика
  const categories = await prisma.category.findMany();
  const products = await prisma.product.count();
  const orders = await prisma.order.count();
  const users = await prisma.user.count();
  const productItems = await prisma.productItem.count();
  const payments = await prisma.payment.count();
  const addresses = await prisma.address.count();

  const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    dim: "\x1b[2m",
  };

  console.log(`${colors.cyan}${colors.bright}📈 Статистика базы данных:${colors.reset}\n`);
  console.log(`  ${colors.green}✓${colors.reset} Пользователи: ${colors.bright}${users}${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Категории: ${colors.bright}${categories.length}${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Товары: ${colors.bright}${products}${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Варианты товаров: ${colors.bright}${productItems}${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Заказы: ${colors.bright}${orders}${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Платежи: ${colors.bright}${payments}${colors.reset}`);
  console.log(`  ${colors.green}✓${colors.reset} Адреса: ${colors.bright}${addresses}${colors.reset}\n`);
}

/**
 * Пересчёт агрегатов корзины по её позициям:
 * - totalItems
 * - subtotal
 * - discount (оставляем 0 для демо)
 * - total
 */

async function recalcCartTotals(prisma: PrismaClient, cartId: number) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { promoCode: true },
  });

  if (!cart) return;

  const items = await prisma.cartItem.findMany({
    where: { cartId },
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  // Рассчитываем скидку по промокоду, если есть
  let discount = 0;
  if (cart.promoCode && cart.promoCode.isActive) {
    const promo = cart.promoCode;
    if (!promo.minOrder || subtotal >= promo.minOrder) {
      if (promo.type === "PERCENT") {
        discount = Math.floor((subtotal * promo.value) / 100);
      } else {
        // AMOUNT
        discount = Math.min(subtotal, promo.value);
      }
    }
  }

  const total = subtotal - discount;

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      totalItems,
      subtotal,
      discount,
      total,
    },
  });
}

/**
 * Демо-корзины + избранное:
 * - корзина админа с несколькими позициями;
 * - гостевая корзина по cartToken;
 * - корзины с промокодами;
 * - избранное для разных пользователей.
 */
async function seedDemoCartsAndFavorites(prisma: PrismaClient) {
  const admin = await prisma.user.findUnique({
    where: { email: "jaksan37@gmail.com" },
  });

  if (!admin) {
    const colors = {
      reset: "\x1b[0m",
      yellow: "\x1b[33m",
      dim: "\x1b[2m",
    };
    console.warn(
      `${colors.yellow}⚠${colors.reset} ${colors.dim}Admin user not found, skip carts/favorites seeding${colors.reset}`,
    );
    return;
  }

  // Получаем пользователей
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    take: 5,
  });

  // Получаем промокоды
  const promoCodes = await prisma.promoCode.findMany({
    where: { isActive: true },
    take: 3,
  });

  // Берём больше вариантов товара
  const productItems = await prisma.productItem.findMany({
    take: 20,
    orderBy: { id: "asc" },
    include: { product: true },
  });

  if (productItems.length === 0) {
    const colors = {
      reset: "\x1b[0m",
      yellow: "\x1b[33m",
      dim: "\x1b[2m",
    };
    console.warn(
      `${colors.yellow}⚠${colors.reset} ${colors.dim}No product items found, skip carts/favorites seeding${colors.reset}`,
    );
    return;
  }

  // --- Корзина админа (userId + cartToken) ---
  const adminCart = await prisma.cart.create({
    data: {
      userId: admin.id,
      cartToken: "demo-cart-admin",
    },
  });

  await prisma.cartItem.createMany({
    data: productItems.slice(0, 3).map((item, index) => ({
      cartId: adminCart.id,
      productItemId: item.id,
      qty: index + 1, // 1, 2, 3
      price: item.price,
    })),
  });

  await recalcCartTotals(prisma, adminCart.id);

  // --- Корзина админа с промокодом ---
  if (promoCodes.length > 0) {
    const promoCart = await prisma.cart.create({
      data: {
        userId: admin.id,
        cartToken: "demo-cart-admin-promo",
        promoCodeId: promoCodes[0].id,
      },
    });

    await prisma.cartItem.createMany({
      data: productItems.slice(3, 6).map((item) => ({
        cartId: promoCart.id,
        productItemId: item.id,
        qty: 2,
        price: item.price,
      })),
    });

    await recalcCartTotals(prisma, promoCart.id);

    // Применяем скидку промокода
    const subtotal = await prisma.cartItem.findMany({
      where: { cartId: promoCart.id },
    }).then(items => items.reduce((sum, item) => sum + item.price * item.qty, 0));

    const promo = promoCodes[0];
    let discount = 0;
    if (!promo.minOrder || subtotal >= promo.minOrder) {
      if (promo.type === "PERCENT") {
        discount = Math.floor((subtotal * promo.value) / 100);
      } else {
        discount = Math.min(subtotal, promo.value);
      }
    }

    await prisma.cart.update({
      where: { id: promoCart.id },
      data: {
        discount,
        total: subtotal - discount,
      },
    });
  }

  // --- Гостевая корзина (только cartToken) ---
  const guestCart = await prisma.cart.create({
    data: {
      cartToken: "demo-cart-guest",
      userId: null,
    },
  });

  await prisma.cartItem.createMany({
    data: productItems.slice(6, 9).map((item) => ({
      cartId: guestCart.id,
      productItemId: item.id,
      qty: 1,
      price: item.price,
    })),
  });

  await recalcCartTotals(prisma, guestCart.id);

  // --- Корзина пользователя с промокодом ---
  if (users.length > 0 && promoCodes.length > 1) {
    const userCart = await prisma.cart.create({
      data: {
        userId: users[0].id,
        cartToken: "demo-cart-user-promo",
        promoCodeId: promoCodes[1].id,
      },
    });

    await prisma.cartItem.createMany({
      data: productItems.slice(9, 12).map((item) => ({
        cartId: userCart.id,
        productItemId: item.id,
        qty: 1,
        price: item.price,
      })),
    });

    await recalcCartTotals(prisma, userCart.id);

    // Применяем скидку промокода
    const subtotal = await prisma.cartItem.findMany({
      where: { cartId: userCart.id },
    }).then(items => items.reduce((sum, item) => sum + item.price * item.qty, 0));

    const promo = promoCodes[1];
    let discount = 0;
    if (!promo.minOrder || subtotal >= promo.minOrder) {
      if (promo.type === "PERCENT") {
        discount = Math.floor((subtotal * promo.value) / 100);
      } else {
        discount = Math.min(subtotal, promo.value);
      }
    }

    await prisma.cart.update({
      where: { id: userCart.id },
      data: {
        discount,
        total: subtotal - discount,
      },
    });
  }

  // --- Избранное для разных пользователей ---
  const favorites = [];

  // Избранное для админа (5 товаров)
  favorites.push(
    ...productItems.slice(0, 5).map((item) => ({
      userId: admin.id,
      productId: item.productId,
    }))
  );

  // Избранное для других пользователей (по 3-4 товара)
  let currentProductIndex = 0;
  for (const user of users.slice(0, 3)) {
    const startIndex: number = currentProductIndex % productItems.length;
    const endIndex = startIndex + 3;
    favorites.push(
      ...productItems.slice(startIndex, endIndex).map((item) => ({
        userId: user.id,
        productId: item.productId,
      }))
    );
    currentProductIndex = endIndex;
  }

  await prisma.favorite.createMany({
    data: favorites,
    skipDuplicates: true,
  });
}

/**
 * Демо-подписки:
 * - user@test.ru — подтверждённая рассылка (footer);
 * - jaksan37@gmail.com — подтверждённая (checkout);
 * - один неподтверждённый email с token.
 */
async function seedDemoSubscriptions(prisma: PrismaClient) {
  const user = await prisma.user.findUnique({
    where: { email: "user@test.ru" },
  });

  const admin = await prisma.user.findUnique({
    where: { email: "jaksan37@gmail.com" },
  });

  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  await prisma.subscription.createMany({
    data: [
      {
        email: "user@test.ru",
        source: "footer",
        isConfirmed: true,
        token: null,
        userId: user ? user.id : null,
        confirmedAt: now,
      },
      {
        email: "jaksan37@gmail.com",
        source: "checkout",
        isConfirmed: true,
        token: null,
        userId: admin ? admin.id : null,
        confirmedAt: tenMinutesAgo,
      },
      {
        email: "new-subscriber@example.com",
        source: "popup",
        isConfirmed: false,
        token: "demo-subscribe-token-1",
        userId: null,
        confirmedAt: null,
      },
    ],
    skipDuplicates: true,
  });
}

/**
 * Промокоды под наше API промокодов.
 *
 * Набор кейсов:
 * - WELCOME10  — базовый процент без ограничений;
 * - SALE500    — фиксированная скидка 500 ₽ при заказе от 3000 ₽;
 * - OLD2024    — просроченный промо;
 * - LIMITED20  — ограниченный по использованию и по времени.
 */
async function seedPromoCodes(prisma: PrismaClient) {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.promoCode.createMany({
    data: [
      {
        code: "WELCOME10",
        type: "PERCENT",
        value: 10, // 10%
        startsAt: yesterday,
        endsAt: null,
        minOrder: null,
        usageLimit: null,
        usedCount: 0,
        isActive: true,
      },
      {
        code: "SALE500",
        type: "AMOUNT",
        value: 50000, // 500 ₽ в копейках
        startsAt: yesterday,
        endsAt: null,
        minOrder: 300000, // от 3000 ₽
        usageLimit: null,
        usedCount: 0,
        isActive: true,
      },
      {
        code: "OLD2024",
        type: "PERCENT",
        value: 15,
        startsAt: lastMonth,
        endsAt: lastWeek, // уже истёк
        minOrder: null,
        usageLimit: null,
        usedCount: 20,
        isActive: false,
      },
      {
        code: "LIMITED20",
        type: "PERCENT",
        value: 20,
        startsAt: yesterday,
        endsAt: tomorrow,
        minOrder: 200000, // от 2000 ₽
        usageLimit: 5,
        usedCount: 2,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

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

  // Метрики (не зависят от пользователей/товаров, но лучше очистить)
  await prisma.conversion.deleteMany();
  await prisma.favoriteAction.deleteMany();
  await prisma.cartAction.deleteMany();
  await prisma.productView.deleteMany();
  await prisma.apiMetric.deleteMany();

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
