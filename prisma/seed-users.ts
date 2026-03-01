import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

/**
 * Сидинг пользователей: только привилегированный админ (jaksan37@gmail.com).
 * Остальные пользователи не создаются; привилегированный не отображается в списке админки и с него нельзя снять админку.
 */
export async function seedUsers(prisma: PrismaClient) {
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const users = [
    {
      name: "Artem",
      secondName: "Chesnov",
      email: "jaksan37@gmail.com",
      passwordHash: hashSync("jaksan13", 10),
      emailVerified: daysAgo(100),
      role: "ADMIN" as const,
      phone: "+7 910 146 25 17",
      createdAt: daysAgo(100),
      updatedAt: daysAgo(100),
    },
    {
      name: "Тестовый",
      secondName: "Пользователь",
      email: "test@gmail.com",
      passwordHash: hashSync("test1234", 10),
      emailVerified: daysAgo(30),
      role: "USER" as const,
      phone: "+7 900 000-00-00",
      createdAt: daysAgo(30),
      updatedAt: daysAgo(30),
    },
  ];

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(
    `[seedUsers] Созданы пользователи: jaksan37@gmail.com (ADMIN), test@gmail.com (USER, пароль: test1234)`
  );
}
