# Мониторинг и отладка в production

Краткое руководство: что смотреть при инцидентах и как искать ошибки.

## Health-эндпоинты

| URL | Назначение |
|-----|------------|
| `GET /api/health` | Liveness: приложение отвечает. Rate limit 200 req/min. |
| `GET /api/health/ready` | Readiness: БД и (при наличии) Redis доступны. Без rate limit. |

**После деплоя** всегда проверять оба. Для балансировщиков/оркестраторов: liveness — `/api/health`, readiness — `/api/health/ready`.

## Request ID (трассировка)

Каждый запрос получает заголовок **`X-Request-ID`** (UUID). Он:

- задаётся в middleware (или приходит от балансировщика);
- передаётся в ответе и в заголовках запроса к API;
- попадает в логи при ошибках (поле `requestId` в контексте).

**Как искать по одному запросу:** в логах (файл или stdout) искать значение `requestId` — все сообщения по этому запросу будут с одним и тем же id.

## Логи

- **Уровень:** `LOG_LEVEL` (trace, debug, info, warn, error). В проде обычно `info`.
- **Файловое логирование:** в production логи пишутся через `logger-enhanced` (если включено). Пути и ротация — в конфигурации приложения.
- **Клиентские ошибки:** отправляются на `POST /api/errors/client` из Error Boundary; в логах ищут по сообщению `Client-side error from ErrorBoundary` и по `requestId`, если клиент передал заголовок.

Подробнее про переменные и настройку логов — в [OPERATIONS.md](OPERATIONS.md).

## Алерты

При 5xx ошибках в API вызывается `alert5xx` (email и/или webhook), если заданы:

- `ALERT_EMAIL`
- `ALERT_WEBHOOK_URL`

Проверить, что в .env на проде указаны нужные значения и уведомления доходят.

## Типичные действия при инциденте

1. **Сайт не открывается**  
   Проверить: `GET /api/health` и `GET /api/health/ready`. Смотреть логи PM2/системные (ошибки старта, падения процесса).

2. **Ошибки при оплате/заказе**  
   В логах искать по маршруту (`POST /api/shop/orders`, `GET /api/payment/success` и т.п.) и по `requestId` из ответа клиенту (заголовок `X-Request-ID`).

3. **Медленные ответы / таймауты**  
   Включить при необходимости: `SLOW_QUERY_LOGGING`, `SLOW_QUERY_THRESHOLD_MS`, `PRISMA_LOG_QUERIES`. Смотреть логи БД и время ответа в логах приложения.

4. **Клиентские падения (Error Boundary)**  
   В логах искать `Client-side error from ErrorBoundary`; в контексте есть `url`, `requestId`, `userAgent`. По `requestId` можно связать с серверными запросами той же сессии, если id передаётся.

## Кэш и revalidate

- Категории, фильтры, списки товаров и карточки товара кэшируются (Route Handlers с `revalidate`, Cache-Control, при необходимости Redis).
- При изменении данных в админке вызывается `POST /api/admin/revalidate` (или revalidate при сохранении товара), чтобы сбросить кэш страниц.
- Если видите «старые» данные — проверить, что revalidate вызывается после изменений, и что на проде не кэширует ли лишнее CDN/прокси.

## Полезные ссылки

- [OPERATIONS.md](OPERATIONS.md) — логи, алерты, бэкапы, деплой.
- [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) — установка и первый запуск на сервере.
- [BACKUPS.md](BACKUPS.md) — резервное копирование БД.
