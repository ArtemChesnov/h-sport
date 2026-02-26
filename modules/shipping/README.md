# Shipping Module

Модуль для работы с доставкой и пунктами выдачи заказов.

## Структура

```
modules/shipping/
├── lib/
│   ├── pickupPoints/         # Пункты выдачи (СДЕК, Почта России)
│   │   ├── index.ts         # Основной сервис
│   │   └── providers/       # Провайдеры ПВЗ
│   │       ├── cdek.ts      # Интеграция с СДЕК
│   │       └── russianpost.ts # Интеграция с Почтой России
│   └── geocoding/           # Геокодирование адресов
│       └── dadata.ts        # Интеграция с DaData
├── types/                   # Типы данных
└── README.md
```

## Использование

```typescript
import { getPickupPoints } from "@/modules/shipping/lib/pickupPoints";
import { getCitySuggestions } from "@/modules/shipping/lib/geocoding/dadata";
```

## Интеграции

### CDEK (Пункты выдачи)
- **Статус:** Mock-ready (graceful degradation)
- **Точка подключения:** `providers/cdek.ts`
- **Требуется:** `CDEK_CLIENT_ID`, `CDEK_CLIENT_SECRET`
- **Документация:** https://confluence.cdek.ru/pages/viewpage.action?pageId=29943991

### DaData (Геокодирование)
- **Статус:** Mock-ready (graceful degradation)
- **Точка подключения:** `geocoding/dadata.ts`
- **Требуется:** `DADATA_TOKEN`
- **Документация:** https://dadata.ru/api/suggest/

### Почта России (Пункты выдачи)
- **Статус:** Mock-ready (graceful degradation)
- **Точка подключения:** `providers/russianpost.ts`
- **Требуется:** API ключи от Почты России
