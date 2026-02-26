# Модуль оплаты

Библиотека оплаты через Robokassa.

## Структура

- `lib/` - основная логика модуля (интеграция с Robokassa, работа с БД)
- `types/` - типы TypeScript

**Примечание:** API роуты находятся в `app/api/payment/` и используют функции из этого модуля.

## Использование

Модуль содержит библиотечные функции для работы с платежами, которые используются API роутами в `app/api/payment/`:

- `lib/robokassa.ts` - интеграция с Robokassa (создание платежей, проверка подписей)
- `lib/db.ts` - работа с БД (создание платежей, обновление статусов)

### API роуты

- `POST /api/payment/create` - создание платежа
- `POST /api/payment/webhook` - обработка webhook от Robokassa
- `GET /api/payment/success` - обработка успешной оплаты
- `GET /api/payment/fail` - обработка неуспешной оплаты

## Переменные окружения

```
ROBOKASSA_MERCHANT_LOGIN=your-merchant-login
ROBOKASSA_PASSWORD_1=your-password-1
ROBOKASSA_PASSWORD_2=your-password-2
ROBOKASSA_IS_TEST=true
ROBOKASSA_HASH_ALGORITHM=md5
```

## Интеграция

Модуль интегрируется с существующей системой заказов через:
- Создание платежей в таблице `Payment`
- Обновление статусов заказов
- Обработка webhook'ов от Robokassa
