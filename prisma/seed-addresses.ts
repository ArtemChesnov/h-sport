import { PrismaClient } from "@prisma/client";

/**
 * Сидинг адресов пользователей на основе адресов из заказов
 */
export async function seedAddresses(prisma: PrismaClient) {
  // Получаем все заказы с пользователями
  const orders = await prisma.order.findMany({
    where: {
      userId: { not: null },
    },
    include: {
      delivery: true,
      user: true,
    },
    distinct: ["userId"],
    orderBy: {
      createdAt: "desc",
    },
  });

  if (orders.length === 0) {
    console.log("[seedAddresses] Нет заказов с пользователями, пропускаю создание адресов.");
    return;
  }

  // Создаём адреса для пользователей на основе их заказов
  const addressesToCreate = [];

  for (const order of orders) {
    if (!order.userId || !order.delivery) continue;

    const user = order.user;
    if (!user) continue;

    // Проверяем, есть ли уже адреса у пользователя
    const existingAddresses = await prisma.address.count({
      where: { userId: order.userId },
    });

    if (existingAddresses > 0) {
      continue; // У пользователя уже есть адреса
    }

    // Создаём адрес на основе адреса доставки
    addressesToCreate.push({
      userId: order.userId,
      name: "Дом",
      country: "Россия",
      city: order.delivery.city ?? "Москва",
      street: order.delivery.address ?? "",
      zip: null,
      phone: order.phone ?? null,
      isDefault: true,
    });

    // Для некоторых пользователей добавляем второй адрес
    if (Math.random() > 0.6 && user.email) {
      const secondCity = order.delivery.city === "Москва" ? "Санкт-Петербург" : "Москва";
      addressesToCreate.push({
        userId: order.userId,
        name: "Офис",
        country: "Россия",
        city: secondCity,
        street: `ул. Офисная, д. ${Math.floor(Math.random() * 50) + 1}, оф. ${Math.floor(Math.random() * 100) + 1}`,
        zip: null,
        phone: order.phone ?? null,
        isDefault: false,
      });
    }
  }

  if (addressesToCreate.length > 0) {
    await prisma.address.createMany({
      data: addressesToCreate,
      skipDuplicates: true,
    });
    console.log(`[seedAddresses] Создано адресов: ${addressesToCreate.length}`);
  } else {
    console.log("[seedAddresses] Адреса не созданы (у пользователей уже есть адреса).");
  }
}
