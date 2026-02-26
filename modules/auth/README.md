# Модуль авторизации

Библиотека авторизации с подтверждением email и восстановлением пароля.

## Структура

- `lib/` - основная логика модуля (база данных, email, пароли, токены)
- `types/` - типы TypeScript

**Примечание:** API роуты находятся в `app/api/auth/` и используют функции из этого модуля.

## Использование

Модуль содержит библиотечные функции, которые используются API роутами в `app/api/auth/`:

- `lib/db.ts` - работа с БД (создание пользователя, проверка учетных данных)
- `lib/password.ts` - хеширование и проверка паролей
- `lib/tokens.ts` - генерация токенов для email и сброса пароля
- `lib/email.ts` - отправка email (верификация, сброс пароля)

## Переменные окружения

```
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
```
