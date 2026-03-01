# Интеграции

## Робокасса (оплата)

- **Переменные окружения** (достаточно заполнить в `.env` и на сервере):
  - `ROBOKASSA_MERCHANT_LOGIN` — идентификатор магазина из ЛК Робокассы
  - `ROBOKASSA_PASSWORD_1` — пароль №1 (для подписи запросов и Success URL)
  - `ROBOKASSA_PASSWORD_2` — пароль №2 (для Result URL / webhook)
  - `ROBOKASSA_IS_TEST` — `true` для тестового режима, `false` для боевого
  - `ROBOKASSA_HASH_ALGORITHM` — алгоритм подписи: `md5`, `sha256` или `sha512` (в ЛК должен совпадать)
- Без конфига создание платежа возвращает mock-URL на «успех»; webhook при вызове без конфига вернёт 500.
- **В личном кабинете Робокассы** (Настройки → Технические настройки) укажите:
  - **Result URL:** `https://h-brand.ru/api/payment/webhook` — уведомление сервера об оплате (обязательно)
  - **Success URL:** `https://h-brand.ru/api/payment/success` — редирект пользователя после успешной оплаты
  - **Fail URL:** `https://h-brand.ru/api/payment/fail` — редирект при отмене/ошибке
- Алгоритм хеширования в ЛК должен совпадать с `ROBOKASSA_HASH_ALGORITHM`.

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
