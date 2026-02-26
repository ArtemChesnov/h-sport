# Архитектура и структура проекта

## Структура каталогов

```
app/                    # Next.js App Router
  (shop)/               # Витрина: главная, каталог, товар, корзина, чекаут, аккаунт, auth
  (admin)/admin/        # Админ-панель: дашборд, заказы, товары, промокоды, рассылки, пользователи, метрики
  api/                  # API routes (auth, shop, admin, payment, shipping, health, metrics)
shared/                 # Общий код
  components/          # UI-компоненты
  hooks/                # React-хуки
  lib/                  # Утилиты: api, auth, cache, csrf, logger, redis, rate-limit, security
  services/             # Сервисы (оркестрация)
  repositories/         # Доступ к данным (Prisma)
  dto/                  # Типы ответов/запросов API
modules/                # Доменные модули: auth, payment, shipping
prisma/                 # Схема, миграции, prisma-client, seed
```

## Слои API

1. **Route** — валидация входа/выхода, вызов сервиса, HTTP-ответ. Часто обёрнут в `withErrorHandling` и `applyRateLimit`.
2. **Service** — бизнес-логика, оркестрация.
3. **Repository** — запросы к БД через Prisma.

Поток: Route → Service → Repository → PostgreSQL.

## Основные потоки

- **Заказ:** корзина → чекаут (адрес, доставка, оплата) → создание заказа → при выборе оплаты редирект на платёж (Robokassa) или mock.
- **Оплата:** создание платежа в БД → генерация URL оплаты → после оплаты webhook обновляет статус заказа/платежа.
- **Доставка:** расчёт тарифа (СДЭК, Почта России) и подсказки адресов (DaData) через API.

## Безопасность

- Middleware: CORS по `ALLOWED_ORIGINS`, security headers (CSP с nonce в prod), CSRF для мутирующих запросов к `/api/*` (whitelist для webhook/auth/metrics).
- Защищённые маршруты: `/account/*` — редирект на sign-in без сессии. Админка: проверка роли на клиенте и в API (`requireAdmin`).
