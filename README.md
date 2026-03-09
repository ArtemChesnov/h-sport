# H-Sport

Интернет-магазин женской спортивной одежды.

**Стек:** Next.js 15 (App Router), TypeScript, PostgreSQL, Prisma, Tailwind CSS, React Query.

---

## Быстрый старт

```bash
npm install
cp .env.example .env
# заполните .env (см. раздел ниже)

npx prisma generate
npx prisma migrate dev

npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

---

## Переменные окружения

Скопируйте `.env.example` в `.env` и задайте значения.

**Обязательно:** `DATABASE_URL`, `AUTH_SECRET` (≥32 символа), `NEXT_PUBLIC_APP_URL`.

**По необходимости:** SMTP (письма), Robokassa (оплата), CDEK/DaData (доставка и подсказки адресов). Полный список — в `.env.example`.

---

## Основные команды

| Команда               | Описание                        |
| --------------------- | ------------------------------- |
| `npm run dev`         | Режим разработки                |
| `npm run build`       | Сборка для production           |
| `npm run start`       | Запуск production-сборки        |
| `npm run lint`        | Проверка линтером               |
| `npm run typecheck`   | Проверка типов                  |
| `npm run prisma:seed` | Заполнение БД тестовыми данными |

---

## Структура

- `app/` — страницы и API (Next.js App Router)
- `shared/` — компоненты, хуки, сервисы, утилиты
- `modules/` — авторизация, оплата, доставка
- `prisma/` — схема БД и миграции

---

## Лицензия

Proprietary
