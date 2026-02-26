# shared/lib

Утилиты, хелперы и сервисная логика без привязки к UI и роутам.

## Структура

| Папка / файл | Назначение |
|--------------|------------|
| **api/** | Обработка ошибок API (`error-handler`, `error-response`), rate-limit middleware, metrics middleware |
| **auth/** | Сессия, middleware, withAuth, privileged, broadcast |
| **business-metrics/** | Утилиты для бизнес-метрик (LTV, abandoned carts, промо) |
| **cart/** | Константы корзины (`MAX_CART_ITEM_QUANTITY`) |
| **catalog/** | Парсер query каталога |
| **config/** | Конфиг и env (серверный) |
| **constants/** | Константы, используемые в lib (например `PLACEHOLDER_PRODUCT_IMAGE`) |
| **data/** | Справочные данные (страны и т.п.) |
| **errors/** | Кастомные ошибки, `isAppError`, `toAppError` |
| **formatters/** | Форматирование дат, денег, плюрализация |
| **generators/** | slugify, SKU-генератор |
| **products/** | Работа с товарами: валидация, slug, popularity, админские mappers/parsers |
| **promo/** | Валидация промо, расчёт скидки, отображение |
| **search/** | Построение поисковой строки |
| **security/** | Security headers, CORS |
| **seo/** | Метаданные, JSON-LD |
| **validation/** | Zod-схемы, валидация форм, query-params, админские продукты |
| **metrics/** | API/серверные метрики, batch, алерты, slow-query logger, database-stats |
| **ecommerce-metrics/** | E-commerce метрики: запись, чтение, агрегация, очистка |
| **web-vitals/** | Web Vitals: клиентский отчёт, чтение/очистка в БД |
| **styles/** | Стили: статусы заказов, карточки метрик, адаптивная вёрстка писем |

Корневые файлы (импортируются напрямую по пути, например `@/shared/lib/rate-limit`):

| Файл | Назначение |
|------|------------|
| **cache.ts** | In-memory кэш с TTL и очисткой |
| **checkout.ts** | Флаги способов доставки |
| **cookie-consent.ts** | Состояние согласия на cookies |
| **csrf.ts** / **csrf-client.ts** | CSRF-токен (сервер / клиент) |
| **logger.ts** | Логгер |
| **pagination.ts** | Пагинация (skip, limit, ответ) |
| **period-converter.ts** | Периоды дашборда (дни, часы) |
| **rate-limit.ts** | Конфиги и логика rate limiting |
| **redis.ts** | Клиент Redis (если используется) |
| **retry.ts** | Повтор запросов |
| **safe-interval.ts** | Интервал с защитой от дрифта |
| **webhook-protection.ts** | Защита webhook от повторов |

Импорты по папкам: `@/shared/lib/metrics`, `@/shared/lib/ecommerce-metrics`, `@/shared/lib/web-vitals`, `@/shared/lib/styles`.

Главный экспорт: `shared/lib/index.ts` — базовые вещи (logger, cn, config, formatters, validation, errors, cache, pagination, rate-limit, api/error-handler, auth, checkout, cookie-consent). Остальное импортируют по полному пути.
