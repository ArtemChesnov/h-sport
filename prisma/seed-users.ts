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
  ];

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`[seedUsers] Создан пользователь: jaksan37@gmail.com (ADMIN)`);
}
