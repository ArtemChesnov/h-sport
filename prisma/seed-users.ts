
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

/**
 * Хелпер для получения даты "N дней назад"
 */
function daysAgo(days: number): Date {
  const now = new Date();
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Сидинг пользователей: создаёт разнообразных пользователей с разными статусами и данными
 * Дата создания пользователя устанавливается ДО их первого заказа для реалистичности
 */
export async function seedUsers(prisma: PrismaClient) {
  const now = new Date();

  // Определяем даты создания пользователей ДО их первых заказов
  // Заказы создаются от 0.5 до 85 дней назад, поэтому пользователи должны быть созданы раньше
  const users = [
    {
      name: "Artem",
      secondName: "Chesnov",
      email: "jaksan37@gmail.com",
      passwordHash: hashSync("jaksan13", 10),
      emailVerified: daysAgo(100), // Админ создан 100 дней назад
      role: "ADMIN" as const,
      phone: "+7 900 123-45-67",
      createdAt: daysAgo(100),
      updatedAt: daysAgo(100),
    },
    {
      name: "Иван",
      secondName: "Иванов",
      email: "ivan@example.com",
      passwordHash: hashSync("password123", 10),
      emailVerified: daysAgo(95), // Регистрация за 5 дней до первого заказа (90 дней назад)
      role: "USER" as const,
      phone: "+7 900 234-56-78",
      createdAt: daysAgo(95), // Первый заказ ~90 дней назад, создаем пользователя на 5 дней раньше
      updatedAt: daysAgo(95),
    },
    {
      name: "Мария",
      secondName: "Петрова",
      email: "maria@example.com",
      passwordHash: hashSync("password123", 10),
      emailVerified: daysAgo(88), // Регистрация за 3 дня до первого заказа
      role: "USER" as const,
      phone: "+7 900 345-67-89",
      createdAt: daysAgo(88), // Первый заказ ~85 дней назад
      updatedAt: daysAgo(88),
    },
    {
      name: "Алексей",
      secondName: "Сидоров",
      email: "alex@example.com",
      passwordHash: hashSync("password123", 10),
      emailVerified: daysAgo(70),
      role: "USER" as const,
      phone: "+7 900 456-78-90",
      createdAt: daysAgo(70), // Первый заказ ~65 дней назад
      updatedAt: daysAgo(70),
    },
    {
      name: "Елена",
      secondName: "Козлова",
      email: "elena@example.com",
      passwordHash: hashSync("password123", 10),
      emailVerified: daysAgo(55),
      role: "USER" as const,
      phone: "+7 900 567-89-01",
      createdAt: daysAgo(55), // Первый заказ ~50 дней назад
      updatedAt: daysAgo(55),
    },
    {
      name: "Дмитрий",
      email: "dmitry@example.com",
      passwordHash: hashSync("password123", 10),
      emailVerified: daysAgo(25), // Регистрация за 5 дней до заказа (20 дней назад)
      role: "USER" as const,
      phone: "+7 900 678-90-12",
      createdAt: daysAgo(25),
      updatedAt: daysAgo(25),
    },
    {
      name: "Анна",
      secondName: "Смирнова",
      email: "anna@example.com",
      passwordHash: hashSync("password123", 10),
      emailVerified: null, // Не подтверждена почта
      role: "USER" as const,
      phone: "+7 900 789-01-23",
      createdAt: daysAgo(50), // Регистрация до заказа (45 дней назад)
      updatedAt: daysAgo(50),
    },
    {
      email: "guest@example.com",
      // Без пароля (через OAuth)
      emailVerified: daysAgo(30),
      role: "USER" as const,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
    {
      name: "User",
      secondName: "Test",
      email: "user@test.ru",
      passwordHash: hashSync("111111", 10),
      emailVerified: daysAgo(90), // Регистрация до первого заказа (80 дней назад)
      role: "USER" as const,
      phone: "+7 900 111-11-11",
      createdAt: daysAgo(90),
      updatedAt: daysAgo(90),
    },
  ];

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`[seedUsers] Создано пользователей: ${users.length}`);
}
