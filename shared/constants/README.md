# shared/constants

Константы приложения: лимиты, тексты, классы UI, настройки кэша и т.д.

## Структура по папкам

| Папка | Содержимое |
|-------|------------|
| **admin/** | Опции статусов и способов доставки заказа (админка) |
| **api/** | Пагинация: лимиты страниц, каталог (CATALOG_DEFAULT_PER_PAGE и т.д.) |
| **cache/** | TTL кэша (cache.ts) и заголовки Cache-Control (cache-control.ts) |
| **checkout/** | Чекаут: способы оплаты, адрес самовывоза; доставка: порог, стоимость |
| **cta/** | CTA-кнопки (перейти в каталог и т.д.) |
| **metrics/** | METRICS_CONSTANTS для дашбордов и метрик |
| **navigation/** | Ссылки меню (MENU_PRIMARY_LINKS, MENU_CUSTOMER_LINKS) |
| **newsletter/** | Шаблоны писем рассылки |
| **time/** | Интервалы в мс (минута, час, день, очистка rate limit и т.д.) |
| **ui/** | Цвета, getColorHex, тема, ui-classes, labels, summary-card |

В корне: **limits.ts**, **toast-messages.ts**, **validation-messages.ts**.

Импорт: `@/shared/constants` (всё через корневой `index.ts`).
