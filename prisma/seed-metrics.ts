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
 * Сидинг метрик: ProductView, CartAction, FavoriteAction, Conversion
 * Согласован с seed-orders: использует тех же пользователей и товары из заказов
 */
export async function seedMetrics(prisma: PrismaClient) {
  // Определяем границу 90 дней для всех метрик
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Получаем пользователей с заказами (реальная статистика)
  const usersWithOrders = await prisma.user.findMany({
    where: {
      role: "USER",
      orders: {
        some: {
          status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
      },
    },
    include: {
      orders: {
        where: {
          status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          items: true,
        },
      },
    },
  });

  // Получаем все пользователи для дополнительных метрик (без заказов)
  const usersWithoutOrders = await prisma.user.findMany({
    where: {
      role: "USER",
      orders: {
        none: {},
      },
    },
    take: 3,
  });

  const allUsers = [...usersWithOrders, ...usersWithoutOrders];

  // Получаем товары из заказов (реальные товары, которые покупались)
  const orderItems = await prisma.orderItem.findMany({
    select: {
      productId: true,
    },
    distinct: ["productId"],
  });

  const productIdsFromOrders = orderItems.map(item => item.productId);

  // Также берем другие товары для разнообразия метрик
  const allProducts = await prisma.product.findMany({
    where: productIdsFromOrders.length > 0 ? {
      OR: [
        { id: { in: productIdsFromOrders } },
      ],
    } : {},
    take: 40,
    orderBy: { id: "asc" },
  });

  if (allProducts.length === 0 || allUsers.length === 0) {
    console.log("[seedMetrics] Недостаточно данных для создания метрик.");
    return;
  }

  // --- ProductView: Просмотры товаров ---
  // Создаем реалистичные просмотры: для пользователей с заказами - просмотры ДО заказов
  const productViews = [];

  // 1. Просмотры для пользователей с заказами - ДО их заказов (для реалистичных конверсий)
  for (const userWithOrders of usersWithOrders) {
    for (const order of userWithOrders.orders) {
      const orderDate = order.createdAt;
      const daysSinceOrder = (now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000);

      // Пропускаем заказы старше 90 дней
      if (daysSinceOrder > 90) continue;

      // Для старых заказов (близко к 90 дням) уменьшаем период просмотров до заказа
      // чтобы просмотры не выходили за пределы 90 дней
      const maxDaysBeforeOrder = daysSinceOrder > 85 ? Math.min(3, 90 - daysSinceOrder) : 7;
      if (maxDaysBeforeOrder < 1) continue; // Если заказ слишком близко к 90 дням, пропускаем

      // Для каждого заказа создаем просмотры товаров за 1-maxDaysBeforeOrder дней ДО заказа
      const daysBeforeOrder = Math.random() * (maxDaysBeforeOrder - 1) + 1; // 1-maxDaysBeforeOrder дней до заказа
      const viewDate = new Date(orderDate.getTime() - daysBeforeOrder * 24 * 60 * 60 * 1000);

      // Убеждаемся, что просмотр не старше 90 дней от СЕГОДНЯ
      if (viewDate < ninetyDaysAgo) continue;

      // Просматриваем товары из этого заказа
      for (const orderItem of order.items) {
        // Создаем 1-3 просмотра каждого товара перед заказом
        const viewsCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < viewsCount; i++) {
          const viewOffset = Math.random() * daysBeforeOrder * 24 * 60 * 60 * 1000;
          const finalViewDate = new Date(viewDate.getTime() - viewOffset);

          // Проверяем, что просмотр в пределах 90 дней от СЕГОДНЯ
          if (finalViewDate >= ninetyDaysAgo) {
            productViews.push({
              productId: orderItem.productId,
              userId: userWithOrders.id,
              createdAt: finalViewDate,
            });
          }
        }
      }
    }
  }

  // 2. Дополнительные случайные просмотры для всех пользователей (за последние 90 дней)
  for (let i = 0; i < 100; i++) {
    const product = allProducts[Math.floor(Math.random() * allProducts.length)];
    const user = Math.random() > 0.4 ? allUsers[Math.floor(Math.random() * allUsers.length)] : null;
    const daysAgo = Math.random() * 90; // Просмотры за последние 90 дней (согласовано с заказами)

    productViews.push({
      productId: product.id,
      userId: user?.id ?? null,
      createdAt: randomDate(daysAgo, daysAgo - 0.5),
    });
  }

  await prisma.productView.createMany({
    data: productViews,
    skipDuplicates: true,
  });

  console.log(`[seedMetrics] Создано просмотров товаров: ${productViews.length}`);

  // --- CartAction: Действия с корзиной ---
  // Создаем действия для пользователей с заказами - ДО их заказов
  const cartActions = [];

  // 1. Действия для пользователей с заказами - добавление в корзину товаров из заказов
  for (const userWithOrders of usersWithOrders) {
    for (const order of userWithOrders.orders) {
      const orderDate = order.createdAt;
      const daysSinceOrder = (now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000);

      // Пропускаем заказы старше 90 дней
      if (daysSinceOrder > 90) continue;

      // Для старых заказов уменьшаем период действий до заказа
      const maxDaysBeforeOrder = daysSinceOrder > 87 ? Math.min(1, 90 - daysSinceOrder) : 3;
      if (maxDaysBeforeOrder < 0.5) continue;

      // Для каждого заказа создаем действия с корзиной за 0.5-maxDaysBeforeOrder дня ДО заказа
      const daysBeforeOrder = Math.random() * (maxDaysBeforeOrder - 0.5) + 0.5;
      const cartActionDate = new Date(orderDate.getTime() - daysBeforeOrder * 24 * 60 * 60 * 1000);

      // Убеждаемся, что действие в пределах 90 дней от СЕГОДНЯ
      if (cartActionDate < ninetyDaysAgo) continue;

      // Добавляем в корзину товары из заказа
      for (const orderItem of order.items) {
        cartActions.push({
          productId: orderItem.productId,
          userId: userWithOrders.id,
          action: "add",
          quantity: orderItem.qty,
          createdAt: cartActionDate,
        });
      }
    }
  }

  // 2. Дополнительные случайные действия для всех пользователей (за последние 90 дней)
  for (let i = 0; i < 60; i++) {
    const product = allProducts[Math.floor(Math.random() * allProducts.length)];
    const user = Math.random() > 0.4 ? allUsers[Math.floor(Math.random() * allUsers.length)] : null;
    const actionTypes = ["add", "remove", "update"];
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const daysAgo = Math.random() * 90; // Действия за последние 90 дней (согласовано с заказами)

    cartActions.push({
      productId: product.id,
      userId: user?.id ?? null,
      action: actionType,
      quantity: actionType === "remove" ? 0 : Math.floor(Math.random() * 3) + 1,
      createdAt: randomDate(daysAgo, daysAgo - 0.1),
    });
  }

  await prisma.cartAction.createMany({
    data: cartActions,
    skipDuplicates: true,
  });

  console.log(`[seedMetrics] Создано действий с корзиной: ${cartActions.length}`);

  // --- FavoriteAction: Действия с избранным ---
  // Создаем действия для пользователей с заказами - добавление в избранное товаров из заказов
  const favoriteActions = [];

  // 1. Действия для пользователей с заказами - добавление в избранное перед заказом
  for (const userWithOrders of usersWithOrders) {
    for (const order of userWithOrders.orders) {
      const orderDate = order.createdAt;
      const daysSinceOrder = (now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000);

      // Пропускаем заказы старше 90 дней
      if (daysSinceOrder > 90) continue;

      // Для части заказов добавляем товары в избранное
      if (Math.random() > 0.6) { // 40% заказов - товары были в избранном
        // Для старых заказов уменьшаем период действий до заказа
        const maxDaysBeforeOrder = daysSinceOrder > 86 ? Math.min(2, 90 - daysSinceOrder) : 6;
        if (maxDaysBeforeOrder < 1) continue;

        const daysBeforeOrder = Math.random() * (maxDaysBeforeOrder - 1) + 1; // 1-maxDaysBeforeOrder дней до заказа
        const favoriteDate = new Date(orderDate.getTime() - daysBeforeOrder * 24 * 60 * 60 * 1000);

        // Убеждаемся, что действие в пределах 90 дней от СЕГОДНЯ
        if (favoriteDate < ninetyDaysAgo) continue;

        // Добавляем в избранное часть товаров из заказа
        for (const orderItem of order.items) {
          if (Math.random() > 0.5) { // 50% товаров в избранном
            favoriteActions.push({
              productId: orderItem.productId,
              userId: userWithOrders.id,
              action: "add",
              createdAt: favoriteDate,
            });
          }
        }
      }
    }
  }

  // 2. Дополнительные случайные действия для всех пользователей (за последние 90 дней)
  for (let i = 0; i < 50; i++) {
    const product = allProducts[Math.floor(Math.random() * allProducts.length)];
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];
    const actionTypes = ["add", "remove"];
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const daysAgo = Math.random() * 90; // Действия за последние 90 дней (согласовано с заказами)

    favoriteActions.push({
      productId: product.id,
      userId: user.id,
      action: actionType,
      createdAt: randomDate(daysAgo, daysAgo - 0.1),
    });
  }

  await prisma.favoriteAction.createMany({
    data: favoriteActions,
    skipDuplicates: true,
  });

  console.log(`[seedMetrics] Создано действий с избранным: ${favoriteActions.length}`);

  // --- Conversion: Конверсии из просмотров в заказы ---
  // Используем уже созданные просмотры и заказы для создания конверсий
  const conversions = [];

  // Проходим по всем заказам пользователей и создаем конверсии
  for (const userWithOrders of usersWithOrders) {
    for (const order of userWithOrders.orders) {
      const orderDate = order.createdAt;
      const daysSinceOrder = (now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000);

      // Пропускаем заказы старше 90 дней
      if (daysSinceOrder > 90) continue;

      // Проверяем, есть ли просмотры товаров из заказа ДО даты заказа
      // Ограничиваем поиск просмотров, чтобы они не выходили за 90 дней
      const maxDaysBeforeOrder = Math.min(7, daysSinceOrder); // не более 7 дней до заказа, но не старше 90 дней
      const viewsBeforeOrder = await prisma.productView.findMany({
        where: {
          userId: userWithOrders.id,
          productId: { in: order.items.map(item => item.productId) },
          createdAt: {
            lte: order.createdAt,
            gte: new Date(Math.max(
              order.createdAt.getTime() - maxDaysBeforeOrder * 24 * 60 * 60 * 1000,
              ninetyDaysAgo.getTime() // но не старше 90 дней от СЕГОДНЯ
            )),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1, // Берем первый просмотр
      });

      if (viewsBeforeOrder.length > 0) {
        // Создаем конверсию для первого товара из заказа, который был просмотрен
        const view = viewsBeforeOrder[0];
        conversions.push({
          type: "view_to_order", // Просмотр привёл к заказу
          productId: view.productId,
          userId: userWithOrders.id,
          orderId: order.id,
          createdAt: order.createdAt,
        });
      }
    }
  }

  if (conversions.length > 0) {
    await prisma.conversion.createMany({
      data: conversions,
      skipDuplicates: true,
    });
    console.log(`[seedMetrics] Создано конверсий: ${conversions.length}`);
  } else {
    console.log("[seedMetrics] Конверсии не созданы (не найдены подходящие просмотры).");
  }

  console.log("[seedMetrics] Сидинг метрик завершён.");
}
