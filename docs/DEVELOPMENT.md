# Локальная разработка

## Требования

- Node.js 20+
- PostgreSQL

## Первый запуск

1. Клонировать репозиторий, установить зависимости:
   ```bash
   npm install
   ```

2. Скопировать и заполнить переменные окружения:
   ```bash
   cp .env.example .env
   ```
   Минимум: `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET`. Для почты/платежей/доставки — см. `.env.example` и [INTEGRATIONS.md](INTEGRATIONS.md).

3. База данных:
   ```bash
   npx prisma migrate deploy
   npm run seed   # опционально: тестовые данные
   ```

4. Запуск:
   ```bash
   npm run dev
   ```

Приложение: http://localhost:3000. Админка: http://localhost:3000/admin (нужен пользователь с ролью ADMIN).

## Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Разработка |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production-сборки |
| `npm run lint` | ESLint |
| `npm run typecheck` | Проверка типов |
| `npx prisma studio` | UI для БД |

## Стиль кода

В путях к файлам и URL использовать только прямой слэш (`/`). Обратный слэш — только в regex/escape.
