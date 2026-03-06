# H-Sport

Интернет-магазин женской спортивной одежды на Next.js 15.

## Технологии

- **Next.js 15.1.6** (App Router, TypeScript)
- **PostgreSQL** (Prisma ORM)
- **React Query** (TanStack Query) для управления состоянием
- **Tailwind CSS** для стилизации

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Настройте переменные окружения:

```bash
cp .env.example .env
# Отредактируйте .env и заполните реальными значениями
```

3. Настройте базу данных:

```bash
# Примените миграции (dev — создаёт БД при необходимости)
npx prisma migrate dev

# (Опционально) Заполните базу тестовыми данными
npm run prisma:seed
```

4. Запустите проект:

```bash
# Development
npm run dev

# Production build (БД при сборке не требуется — главная и каталог отдаются по первому запросу)
npm run build
npm start
```

## Стиль кода

- **Пути:** в коде и конфигах используйте только прямой слэш (`/`) в путях к файлам и URL. Обратный слэш допустим только в regex и escape-последовательностях, не в path-строках.

## Configuration / ENV

Проект использует переменные окружения для конфигурации. Полный список переменных с описаниями находится в файле `.env.example`.

### Ключевые переменные

**Обязательные:**

- `DATABASE_URL` - строка подключения к PostgreSQL

**Рекомендуемые:**

- `AUTH_SECRET` - секретный ключ для JWT токенов (минимум 32 символа)
- `NEXT_PUBLIC_APP_URL` - публичный URL приложения

**Интеграции (опционально):**

- `SMTP_*` - настройки для отправки email
- `ROBOKASSA_*` - настройки для платежной системы Robokassa
- `CDEK_*` - API ключи для доставки СДЕК
- `DADATA_TOKEN` - токен для DaData API (подсказки адресов)

Для полного списка переменных и их описаний см. `.env.example`.

## Документация

В каталоге [docs/](docs/README.md): архитектура, API, интеграции, [инструкция по админке](docs/ADMIN_USER_GUIDE.md).

## Структура проекта

Подробнее: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — структура приложения и слои API.

```
app/                    # Next.js App Router
  (shop)/               # Публичная часть (витрина)
  (admin)/              # Админ-панель
  api/                  # API routes

shared/                 # Общий код
  components/           # React компоненты
  hooks/                # React хуки
  lib/                  # Утилиты и helpers
  services/             # Бизнес-сервисы (оркестрация)
  repositories/         # Репозитории (слой доступа к данным)

modules/                # Модули (auth, payment, shipping)
prisma/                 # Prisma schema и миграции
```

## Архитектура API

Проект использует трёхслойную архитектуру:

1. **Route (Controller)** — тонкий слой: валидация входа/выхода, вызов сервиса, HTTP-ответы
2. **Service** — бизнес-логика, оркестрация, правила
3. **Repository** — Prisma-запросы к БД, без бизнес-логики

```
API Route  ──▶  Service  ──▶  Repository  ──▶  PostgreSQL
(Validation)   (Business Logic)   (Prisma)   (Database)
```

**Пример использования:**

```typescript
// Route (app/api/shop/categories/route.ts)
export async function GET(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "catalog");
  if (rateLimitResponse) return rateLimitResponse;

  const response = await CategoriesService.getAll();
  return NextResponse.json(response, { status: 200 });
}

// Service (shared/services/categories.service.ts)
export class CategoriesService {
  static async getAll(): Promise<DTO.CategoriesResponseDto> {
    const categories = await CategoriesRepository.findAll();
    return this.mapToResponse(categories);
  }
}

// Repository (shared/repositories/categories.repository.ts)
export class CategoriesRepository {
  static async findAll(): Promise<CategorySelectResult[]> {
    return prisma.category.findMany({ orderBy: { id: "asc" } });
  }
}
```

## Rate Limiting

Все публичные endpoints защищены rate limiting:

| Preset    | Лимит       | Применение                  |
| --------- | ----------- | --------------------------- |
| `catalog` | 100 req/min | Каталог, категории, фильтры |
| `product` | 120 req/min | Детальная страница товара   |
| `cart`    | 60 req/min  | Операции с корзиной         |
| `auth`    | 10 req/min  | Авторизация (строгий)       |
| `heavy`   | 20 req/min  | Тяжёлые операции            |
| `admin`   | 200 req/min | Админские endpoints         |

**Использование:**

```typescript
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";

export async function GET(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "catalog");
  if (rateLimitResponse) return rateLimitResponse;
  // ... основная логика
}
```

При превышении лимита возвращается HTTP 429 с заголовками:

- `Retry-After` — через сколько секунд можно повторить
- `X-RateLimit-Limit` — максимум запросов
- `X-RateLimit-Remaining` — осталось запросов
- `X-RateLimit-Reset` — время сброса счётчика

## Prisma Query Logging

Включено логирование медленных запросов (по умолчанию > 100ms):

```bash
# .env
SLOW_QUERY_THRESHOLD_MS=100      # порог медленного запроса
SLOW_QUERY_LOGGING=true          # включить/выключить логирование
PRISMA_LOG_QUERIES=true          # включить все query логи (dev only)
```

## Скрипты

- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для production
- `npm run start` - запуск production сборки
- `npm run lint` - проверка кода линтером
- `npm run typecheck` - проверка типов TypeScript
- `npm run prisma:seed` - заполнение базы тестовыми данными

## Перед пушем

- Не коммитьте `.env` — только `.env.example` с плейсхолдерами
- Не коммитьте файлы с реальными паролями, API-ключами, IP-адресами
- Внутренние отчёты, чек-листы и папки IDE (`.idea`) перечислены в `.gitignore`

## Лицензия

Proprietary
