/**
 * Экспорты репозиториев
 *
 * Репозиторий — слой работы с данными (Prisma).
 * Содержит только запросы к БД, без бизнес-логики.
 */

export { CategoriesRepository } from "./categories.repository";
export { FavoritesRepository } from "./favorites.repository";
export { OrdersRepository } from "./orders.repository";
