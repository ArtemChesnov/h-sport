# Интеграции

## Робокасса (оплата)

- Переменные: `ROBOKASSA_MERCHANT_LOGIN`, `ROBOKASSA_PASSWORD_1`, `ROBOKASSA_PASSWORD_2`, опционально `ROBOKASSA_IS_TEST`, `ROBOKASSA_HASH_ALGORITHM`.
- Без конфига создание платежа возвращает mock-URL на «успех»; webhook при вызове без конфига вернёт 500.
- После настройки: в ЛК Робокассы указать Result URL: `https://h-brand.ru/api/payment/webhook`.

## СДЭК (доставка)

- Переменные: `CDEK_CLIENT_ID`, `CDEK_CLIENT_SECRET`, `CDEK_IS_TEST` (тест — api.edu.cdek.ru), `CDEK_FROM_CITY_CODE` (код города отправки, по умолчанию 137 — Нижний Новгород).

## Почта России (тарифы Postcalc.RU)

- `POSTCALC_FROM_CITY`, `POSTCALC_KEY` (test — лимит запросов, платный ключ в ЛК postcalc.ru).

## DaData (подсказки адресов)

- `DADATA_TOKEN` — API-токен.

## SMTP (письма)

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`. Опционально: `SMTP_ALLOW_INSECURE_TLS`.
- Используется для: регистрация, сброс пароля, верификация email, рассылки.

## Доставка (общее)

- `DELIVERY_FEE_KOPECKS` — фиксированная доплата за доставку в копейках.

Полный список переменных и примеры: корневой `.env.example`.
