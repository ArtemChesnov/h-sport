/**
 * Репозиторий для работы с категориями
 *
 * Инкапсулирует Prisma-запросы, без бизнес-логики.
 */

import { prisma } from "@/prisma/prisma-client";
import type { Category } from "@prisma/client";

export type CategorySelectResult = Pick<Category, "id" | "name" | "slug">;

export class CategoriesRepository {
  /**
   * Получает все категории, отсортированные по id
   */
  static async findAll(): Promise<CategorySelectResult[]> {
    return prisma.category.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  /**
   * Получает категорию по slug
   */
  static async findBySlug(slug: string): Promise<CategorySelectResult | null> {
    return prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }

  /**
   * Получает категорию по id
   */
  static async findById(id: number): Promise<CategorySelectResult | null> {
    return prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
  }
}
