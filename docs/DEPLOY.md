# Деплой и окружение

## Обязательные переменные на сервере

Задавать только в .env на сервере или в секретах CI. Не коммитить.

| Переменная | Описание |
|------------|----------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URL PostgreSQL (прод) |
| `NEXT_PUBLIC_APP_URL` | URL сайта, напр. `https://h-sport.ru` |
| `AUTH_SECRET` | Минимум 32 символа: `openssl rand -base64 32` |
| `REDIS_URL` | URL Redis (в production обязателен) |
| `ALLOWED_ORIGINS` | Домены через запятую: `https://h-sport.ru,https://www.h-sport.ru` |
| `ALLOW_ANY_ORIGIN` | Не задавать или `false` |

При старте вызывается `validateConfig()` — без корректных `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` и в prod без `REDIS_URL` приложение не запустится.

## Порядок деплоя

1. На сервере: клонировать репозиторий, установить Node 20+, PostgreSQL, Redis.
2. Создать `.env` с переменными выше.
3. Установка и сборка:
   ```bash
   npm ci
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```
4. Запуск из standalone (при `NODE_ENV=production` в next.config включён `output: "standalone"`):
   ```bash
   node .next/standalone/server.js
   ```
   Рабочая директория — та, где есть `.next/standalone` и при необходимости `public`. Рекомендуется процесс-менеджер (PM2, systemd).

## Проверка после деплоя

- `GET /api/health` — общий статус (БД, Redis, uptime).
- `GET /api/health/ready` — readiness: 200 только при доступных БД и Redis. Использовать для оркестрации/балансировщика.

Подробный чек-лист перед первым продом: [PRE_PROD_CHECKLIST.md](../PRE_PROD_CHECKLIST.md).
