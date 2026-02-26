# API

## Общее

- Публичные эндпоинты защищены rate limiting (пресеты: catalog, product, cart, auth, heavy, admin).
- Мутирующие запросы (POST/PUT/PATCH/DELETE) к `/api/*` требуют CSRF-токен (cookie + заголовок). Исключения: webhook, auth, часть metrics.
- Ответы и ошибки унифицированы через `withErrorHandling` и типы в `shared/dto`.

## Группы маршрутов

| Группа | Назначение |
|--------|------------|
| ` /api/auth/*` | signin, signup, reset-password, verify-email, me, signout |
| ` /api/shop/*` | cart, orders, favorites, products, categories, filters, newsletter, profile |
| ` /api/admin/*` | orders, products, promos, users, newsletter, dashboard, upload, revalidate, metrics, email-templates |
| ` /api/payment/*` | create, success, fail, webhook, receipt |
| ` /api/shipping/*` | calculate-delivery, pickup-points, suggestions |
| ` /api/health`, ` /api/health/ready` | Health и readiness |
| ` /api/metrics/*` | Метрики (часть с requireAdmin) |
| ` /api/errors/client` | Приём клиентских ошибок |
| ` /api/openapi.json` | OpenAPI-спека |

## Документация по эндпоинтам

Полный список и форматы запросов/ответов: **GET /api/openapi.json** (или Swagger UI, если подключён). В коде маршруты разнесены по папкам в `app/api/`.
