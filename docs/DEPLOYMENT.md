# Деплой H-Sport на VPS

Пошаговая инструкция для развёртывания интернет-магазина на собственном сервере. Подходит для тех, кто не знаком с программированием — все команды приведены целиком.

---

## 1. Выбор VPS

### Минимальные требования

| Параметр | Минимум          | Рекомендуется    |
| -------- | ---------------- | ---------------- |
| RAM      | 2 ГБ             | 4 ГБ             |
| CPU      | 1 vCPU           | 2 vCPU           |
| Диск     | 20 ГБ SSD        | 40 ГБ SSD        |
| ОС       | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Почему минимум 2 ГБ RAM

Сборка Next.js (`npm run build`) потребляет много памяти. На 1 ГБ сборка может завершиться с ошибкой.

### Провайдеры VPS (примеры)

| Провайдер         | Примерная цена | Примечание                             |
| ----------------- | -------------- | -------------------------------------- |
| **Timeweb Cloud** | от 300 ₽/мес   | Удобная панель, есть тарифы с 2 ГБ RAM |
| **Selectel**      | от 300 ₽/мес   | Надёжность, дата-центры в РФ           |
| **Reg.ru**        | от 200 ₽/мес   | Популярный, есть поддержка             |
| **Vscale**        | от 300 ₽/мес   | Гибкая настройка                       |
| **DigitalOcean**  | от $6/мес      | Международный, оплата в долларах       |

### Что заказать

1. **VPS** — 2 vCPU, 4 ГБ RAM, 40 ГБ SSD, Ubuntu 22.04 LTS.
2. **Домен** — если ещё нет (например, `example.com`).
3. **SSL-сертификат** — обычно бесплатный Let's Encrypt (настраивается через Nginx или Caddy).

---

## 2. Подключение к серверу

После заказа VPS вы получите:

- **IP-адрес** — например `123.45.67.89`
- **Логин** — обычно `root` или `deploy`
- **Пароль** или **SSH-ключ**

### Windows (PowerShell или Git Bash)

```bash
ssh root@123.45.67.89
```

При первом подключении введите `yes` и пароль. После входа вы окажетесь в терминале сервера.

---

## 3. Установка на сервере (Ubuntu)

Все команды выполняются **на сервере** по очереди.

### 3.1 Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 3.2 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

Должно быть `v20.x.x`.

### 3.3 Git

```bash
sudo apt install -y git
git --version
```

### 3.4 PM2 (менеджер процессов)

```bash
sudo npm install -g pm2
pm2 -v
```

### 3.5 PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

Создание пользователя и базы (замените `ВАШ_ПАРОЛЬ` на свой надёжный пароль):

```bash
sudo -u postgres psql -c "CREATE USER hsport WITH PASSWORD 'ВАШ_ПАРОЛЬ';"
sudo -u postgres psql -c "CREATE DATABASE hsport OWNER hsport;"
```

### 3.6 Redis

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
redis-cli ping
```

Ответ должен быть `PONG`.

---

## 4. Клонирование проекта

```bash
cd ~
git clone https://github.com/ВАШ_АККАУНТ/h-sport.git
cd h-sport
```

Замените `ВАШ_АККАУНТ` на имя вашего репозитория на GitHub.

---

## 5. Настройка переменных окружения

Создайте файл `.env`:

```bash
nano ~/h-sport/.env
```

Скопируйте содержимое из `.env.example` в проекте и заполните **реальные** значения:

| Переменная            | Описание                        | Пример                                                 |
| --------------------- | ------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`        | Подключение к PostgreSQL        | `postgresql://hsport:ВАШ_ПАРОЛЬ@localhost:5432/hsport` |
| `AUTH_SECRET`         | Секрет для сессий (32+ символа) | Сгенерировать: `openssl rand -base64 32`               |
| `REDIS_URL`           | Подключение к Redis             | `redis://localhost:6379`                               |
| `NODE_ENV`            | Режим                           | `production`                                           |
| `NEXT_PUBLIC_APP_URL` | URL сайта                       | `https://ваш-домен.ru`                                 |

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`.

---

## 6. Первая сборка и запуск

```bash
cd ~/h-sport
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Команду из вывода `pm2 startup` выполните — она добавит автозапуск при перезагрузке сервера.

---

## 7. Проверка

```bash
pm2 status
pm2 logs h-sport
```

В браузере откройте `http://ваш-ip:3000` и `http://ваш-ip:3000/api/health`.

---

## 8. Домен и SSL (опционально)

Чтобы сайт работал по `https://ваш-домен.ru`:

1. **Nginx** — установите Nginx, настройте reverse proxy на порт 3000 и SSL через Let's Encrypt (Certbot).
2. **Caddy** — альтернатива, автоматически получает SSL.

Подробные инструкции по Nginx и Certbot: [официальная документация Ubuntu](https://ubuntu.com/server/docs/web-servers-nginx).

---

## 9. Обновление после изменений

Когда вы обновили код и загрузили его на GitHub:

```bash
cd ~/h-sport
./scripts/server-deploy.sh
```

Скрипт подтянет изменения, пересоберёт проект и перезапустит приложение.

---

## 10. Что не коммитить в GitHub

⚠️ **Публичный репозиторий** — не коммитьте:

- `.env` — файл с паролями и ключами
- Файлы с реальными IP, паролями, API-ключами
- Внутренние отчёты и чек-листы

Файл `.env.example` — коммитить можно, он содержит только шаблоны переменных.

---

## 11. Полезные команды PM2

| Действие   | Команда                            |
| ---------- | ---------------------------------- |
| Статус     | `pm2 status`                       |
| Логи       | `pm2 logs h-sport`                 |
| Рестарт    | `pm2 restart h-sport --update-env` |
| Остановить | `pm2 stop h-sport`                 |

---

## 12. Дополнительные интеграции

После успешного запуска можно добавить в `.env`:

- **SMTP** — для отправки писем (подтверждение email, уведомления о заказах)
- **Robokassa** — для приёма оплаты
- **CDEK** — для расчёта доставки
- **DaData** — для подсказок адресов

Полный список переменных см. в `.env.example`.
