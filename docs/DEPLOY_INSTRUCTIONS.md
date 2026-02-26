# Инструкция: деплой на Ubuntu с PM2

Почту не настраиваем до появления доступа. Ниже: установка всего нужного на Ubuntu, первый выкат, PM2, бэкапы, деплой после пуша в GitHub. Пуш в GitHub делаете вручную (git add, commit, push).

---

## 1. Установка на Ubuntu (по шагам)

Работа выполняется на сервере под пользователем с sudo (далее — ваш пользователь; при необходимости замените `deploy` на своего).

### 1.1 Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # должно быть v20.x
npm -v
```

### 1.3 Git

```bash
sudo apt install -y git
git --version
```

### 1.4 PM2 (глобально)

```bash
sudo npm install -g pm2
pm2 -v
```

### 1.5 PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql
```

Создать пользователя и базу (подставьте свой пароль вместо `ваш_надёжный_пароль`):

```bash
sudo -u postgres psql -c "CREATE USER hsport WITH PASSWORD 'ваш_надёжный_пароль';"
sudo -u postgres psql -c "CREATE DATABASE hsport OWNER hsport;"
sudo -u postgres psql -c "\q"
```

Проверка: `sudo -u postgres psql -c "\l"` — в списке должна быть база `hsport`.

### 1.6 Redis

В проде Redis обязателен (rate limit, кеш); без него приложение не стартует.

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
sudo systemctl status redis-server
redis-cli ping   # ответ: PONG
```

В `.env` укажите: `REDIS_URL=redis://localhost:6379` (если пароль не задан).

---

## 2. Клонирование репозитория и .env

```bash
cd ~
git clone https://github.com/ArtemChesnov/h-sport.git
cd h-sport
```

### Настройка доступа к GitHub по SSH (чтобы `git pull` без пароля)

Выполнять на сервере под пользователем, от которого будете делать деплой.

1. **Создать SSH-ключ** (если ещё нет `~/.ssh/id_ed25519`):
   ```bash
   ssh-keygen -t ed25519 -C "сервер-h-sport" -f ~/.ssh/id_ed25519 -N ""
   ```
   `-N ""` — без пароля (cron/GitHub Actions смогут использовать ключ без ввода).

2. **Показать публичный ключ** и скопировать его:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

3. **Добавить ключ в GitHub:** GitHub → правый верхний угол → Settings → SSH and GPG keys → New SSH key. Вставить скопированную строку, сохранить.

4. **Проверить подключение:**
   ```bash
   ssh -T git@github.com
   ```
   Ожидаемый вывод: `Hi ArtemChesnov! You've successfully authenticated...`

5. **Если репозиторий клонировали по HTTPS** — переключить на SSH, чтобы `git pull` ходил по ключу:
   ```bash
   cd ~/h-sport
   git remote set-url origin git@github.com:ArtemChesnov/h-sport.git
   git pull origin main
   ```
   (для своего форка замените `ArtemChesnov` на свой логин GitHub.)

После этого `git pull` и скрипт `server-deploy.sh` будут работать без запроса пароля.

### SSH на вашем ПК (Windows): что, где, зачем

Если вы пушите в GitHub **со своего компьютера** по SSH (`git@github.com:...`), а не по HTTPS:

- **Что делать:** один раз «доверить» хосту GitHub (добавить его ключ в `known_hosts`) и указать репозиторию адрес через SSH.
- **Где:** на вашем ПК (не на сервере). Папка с ключами: `C:\Users\ВАШ_ЛОГИН\.ssh\` (файл `known_hosts`). Проект: папка `h-sport` на рабочем столе.
- **Зачем:** иначе при первом `git push` или `git pull` по SSH будет ошибка «Host key verification failed» и Git не подключится.

**Команды (выполнить в Git Bash или в терминале, где есть `ssh`):**

```bash
# 1. Добавить ключ GitHub в список доверенных хостов (один раз на ПК)
ssh-keyscan github.com >> ~/.ssh/known_hosts

# 2. В папке проекта переключить remote с HTTPS на SSH
cd /c/Users/CHE/Desktop/h-sport
git remote set-url origin git@github.com:ArtemChesnov/h-sport.git

# 3. Проверка: следующий push/pull пойдёт по SSH
git fetch origin
```

После этого `git push` и `git pull` будут ходить в GitHub по SSH (по вашему ключу из `~/.ssh/id_ed25519` или `~/.ssh/id_rsa`). Если ключа ещё нет, создайте его (`ssh-keygen -t ed25519 -C "ваш@email"`) и добавьте публичный ключ в GitHub: Settings → SSH and GPG keys.

---

Создайте `.env` в корне проекта по той же структуре, что и в проекте (значения — продовые, не копируйте локальный .env с паролями):

```bash
nano .env
```

Пример содержимого (подставьте свои значения):

```env
# ============================================
# H-Sport - Production
# ============================================

# REQUIRED
DATABASE_URL="postgresql://hsport:ваш_надёжный_пароль@localhost:5432/hsport"
NODE_ENV="production"

# RECOMMENDED
NEXT_PUBLIC_APP_URL="https://ваш-домен.ru"
AUTH_SECRET="сгенерировать: openssl rand -base64 32"
AUTH_URL="https://ваш-домен.ru"

# EMAIL (SMTP) — когда будет доступ к почте
# SMTP_HOST="smtp.yandex.ru"
# SMTP_PORT="465"
# SMTP_USER="..."
# SMTP_PASSWORD="..."
# SMTP_FROM="H-Sport <...>"

# CDEK API
CDEK_CLIENT_ID="..."
CDEK_CLIENT_SECRET="..."
CDEK_IS_TEST="true"
CDEK_FROM_CITY_CODE="137"

# DaData API
DADATA_TOKEN="..."

# ROBOKASSA — когда подключите
# ROBOKASSA_MERCHANT_LOGIN=""
# ROBOKASSA_PASSWORD_1=""
# ROBOKASSA_PASSWORD_2=""
# ROBOKASSA_IS_TEST="true"
# ROBOKASSA_HASH_ALGORITHM="sha256"

# LOGGING
LOG_LEVEL="info"
PRISMA_LOG_QUERIES="false"
ENABLE_FILE_LOGGING=true

# SECURITY — в production НЕ использовать ALLOW_ANY_ORIGIN=true
ALLOWED_ORIGINS="https://ваш-домен.ru,https://www.ваш-домен.ru"

# Redis обязателен в production
REDIS_URL=redis://localhost:6379
ENABLE_PRODUCT_PRE_RENDER=true
```

Почту (SMTP) и Робокассу можно добавить позже, когда будет доступ.

---

## 3. Первая сборка и запуск

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

Команду из вывода `pm2 startup` выполните (она добавит автозапуск PM2 при перезагрузке).

Проверка: `pm2 status`, `pm2 logs h-sport`. В браузере: `https://ваш-домен.ru`, `https://ваш-домен.ru/api/health`.

---

## 4. PM2

| Действие        | Команда |
|-----------------|--------|
| Старт           | `pm2 start ecosystem.config.cjs` |
| Рестарт         | `pm2 restart h-sport --update-env` |
| Логи             | `pm2 logs h-sport` |
| Статус           | `pm2 status` |

Конфиг: корневой `ecosystem.config.cjs` (приложение `h-sport`, запуск `node .next/standalone/server.js`).

---

## 5. Бэкапы БД

Подробно: [BACKUPS.md](BACKUPS.md).

Кратко: скрипт `scripts/backup-db.sh` (читает `DATABASE_URL` из `.env`), cron раз в день, например:

```bash
0 3 * * * /home/deploy/h-sport/scripts/backup-db.sh >> /var/log/h-sport-backup.log 2>&1
```

---

## 6. Деплой после изменений

Пуш в GitHub делаете вручную у себя:

```bash
git add .
git commit -m "описание"
git push origin main
```

Дальше — один из вариантов.

### Вариант A — вручную на сервере

По SSH зайти на сервер и выполнить:

```bash
cd ~/h-sport
./scripts/server-deploy.sh
```

Скрипт делает: `git pull`, `npm ci`, `npx prisma generate`, `npx prisma migrate deploy`, `npm run build`, `pm2 restart h-sport`.

### Вариант B — автоматически через GitHub Actions

При пуше в `main` workflow подключается к серверу по SSH и запускает тот же деплой.

1. В GitHub: репозиторий → Settings → Secrets and variables → Actions. Добавить секреты:
   - `SSH_HOST` — IP или хост сервера
   - `SSH_USER` — пользователь (например `deploy`)
   - `SSH_PRIVATE_KEY` — содержимое приватного SSH-ключа

2. На сервере у этого пользователя в `~/.ssh/authorized_keys` должен быть соответствующий публичный ключ.

3. Workflow уже в репозитории: `.github/workflows/deploy.yml`. Если проект лежит не в `/home/deploy/h-sport`, в секретах добавить `DEPLOY_PATH` (полный путь к каталогу проекта).

После настройки каждый пуш в `main` будет подтягиваться на сервер и перезапускаться через `server-deploy.sh`.

---

## 7. Чек-лист

| Шаг | Действие |
|-----|-----------|
| 1 | Ubuntu: Node 20, Git, PM2, PostgreSQL, Redis (все по шагам выше) |
| 2 | Создать пользователя и базу PostgreSQL, включить и запустить Redis |
| 3 | Клонировать репозиторий, создать `.env` |
| 4 | npm ci, prisma generate, prisma migrate deploy, npm run build |
| 5 | pm2 start ecosystem.config.cjs, pm2 save, pm2 startup |
| 6 | Настроить бэкапы (см. BACKUPS.md) |
| 7 | Пуш в GitHub — вручную. На сервере: вручную запускать `./scripts/server-deploy.sh` или включить GitHub Actions |

Почту (SMTP) можно добавить в `.env` позже.
