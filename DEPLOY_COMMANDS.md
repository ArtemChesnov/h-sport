# Полный деплой H-Sport на чистый Ubuntu 22.04

Подробная пошаговая инструкция: от переустановки ОС до работающего сайта.

- Сервер: `62.113.44.100`
- Домен: `h-brand.ru`
- Хостинг: Timeweb
- Пользователь на сервере: `deploy` (можете назвать по-другому, но тогда меняйте во всех командах)

---

## Перед началом (только если переустанавливаете ОС)

Если сервер с нуля — пропустите этот раздел.

Если переустанавливаете ОС на уже работающем сервере — **сначала сохраните данные**, иначе всё потеряете.

### Бэкап базы данных

На сервере:

```bash
cd /tmp && sudo -u postgres pg_dump hsport > /tmp/hsport_backup.sql
ls -lh /tmp/hsport_backup.sql
```

**Ожидаемый результат:** файл `hsport_backup.sql` размером в несколько мегабайт.

### Скачать бэкап на свой компьютер

На вашем компьютере (PowerShell):

```powershell
scp -P 2222 -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100:/tmp/hsport_backup.sql C:\Users\CHE\Desktop\
```

### Скопировать .env

На вашем компьютере (PowerShell):

```powershell
scp -P 2222 -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100:/home/deploy/h-sport/.env C:\Users\CHE\Desktop\env_backup.txt
```

**Проверьте:** откройте `env_backup.txt` — там должны быть все переменные (DATABASE_URL, AUTH_SECRET и т.д.).

После этого переустанавливайте ОС через панель Timeweb (Сервер → Переустановка ОС → Ubuntu 22.04).

---

## Часть 1. Установка ПО

### Шаг 1. Подключиться к серверу как root

После переустановки ОС Timeweb пришлёт **root-пароль** на почту.

Есть два способа подключиться:

- **Способ А (VNC):** В панели Timeweb → Сервер → VNC-консоль (кнопка "Консоль"). Это как монитор, подключённый к серверу — работает всегда, даже если SSH сломан.
- **Способ Б (SSH):** Откройте PowerShell на своём компьютере:

```powershell
ssh root@62.113.44.100
```

Введите пароль из письма. При первом подключении спросит "Are you sure you want to continue connecting?" — напишите `yes`.

**Ожидаемый результат:** вы видите командную строку типа `root@server:~#`.

> **Все команды Части 1 и Части 2 выполняются под root.**

---

### Шаг 2. Обновить систему

Зачем: закрываем известные уязвимости в установленных пакетах.

```bash
apt update && apt upgrade -y
```

Ожидание: 1-3 минуты. Может спросить про конфиги — жмите Enter (оставить текущие).

**Проверка:**

```bash
echo "OK: система обновлена"
```

Если команда `apt update` выдаёт ошибку — проверьте интернет на сервере: `ping -c 3 google.com`.

---

### Шаг 3. Установить Node.js 22

Зачем: приложение написано на Next.js — для запуска нужен Node.js. Ставим версию 22 (текущий LTS).

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
```

**Проверка:**

```bash
node -v && npm -v
```

**Ожидаемый результат:** `v22.x.x` и `10.x.x` (или новее). Если `node -v` пишет "command not found" — повторите обе команды выше.

---

### Шаг 4. Установить Git и утилиты

Зачем: Git — для скачивания кода с GitHub. curl/wget — для скачивания файлов.

```bash
apt install -y git curl wget
```

**Проверка:**

```bash
git --version
```

**Ожидаемый результат:** `git version 2.x.x`.

---

### Шаг 5. Установить PM2

Зачем: PM2 — менеджер процессов. Он следит, чтобы приложение:

- работало постоянно (перезапускает при падении)
- запускалось автоматически после перезагрузки сервера
- писало логи

```bash
npm install -g pm2
```

**Проверка:**

```bash
pm2 -v
```

**Ожидаемый результат:** версия PM2 (например `5.x.x`).

---

### Шаг 6. Установить PostgreSQL

Зачем: основная база данных приложения — хранит товары, заказы, пользователей.

```bash
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

**Проверка:**

```bash
systemctl status postgresql | head -5
```

**Ожидаемый результат:** `Active: active (exited)` — значит работает.

Теперь создаём пользователя и базу данных. **Придумайте надёжный пароль** (буквы, цифры, минимум 20 символов). Или сгенерируйте:

```bash
openssl rand -base64 24
```

**Запишите этот пароль** — он нужен для .env файла (переменная DATABASE_URL).

Создать пользователя и БД (вставьте свой пароль вместо `ВАШ_ПАРОЛЬ_БД`):

```bash
cd /tmp
sudo -u postgres psql -c "CREATE USER hsport WITH PASSWORD 'ВАШ_ПАРОЛЬ_БД';"
sudo -u postgres psql -c "CREATE DATABASE hsport OWNER hsport;"
```

**Проверка** — подключиться к базе:

```bash
sudo -u postgres psql -c "\l" | grep hsport
```

**Ожидаемый результат:** строка с `hsport` в списке баз данных.

> **Частая ошибка:** если позже в .env напишете неправильный пароль БД — приложение будет падать с ошибкой `Authentication failed against database server`. В этом случае проверьте, что пароль в DATABASE_URL совпадает с тем, что задали здесь.

---

### Шаг 7. Redis (НЕ обязательно)

В текущей версии приложения **Redis не используется** — rate limiting и кеш работают in-memory. Устанавливать Redis **не нужно**.

> **Историческая справка:** именно незащищённый Redis (без пароля, открытый в интернет) стал причиной взлома сервера крипто-майнерами. Сейчас Redis из проекта удалён, что устраняет этот вектор атаки. Если в будущем вернёте Redis — **обязательно** настройте пароль (`requirepass`), привяжите к localhost (`bind 127.0.0.1`) и закройте порт 6379 в UFW.

---

### Шаг 8. Установить Nginx

Зачем: Nginx — веб-сервер, который стоит между интернетом и вашим приложением. Он:

- принимает запросы из интернета на порты 80/443
- перенаправляет их на приложение (localhost:3000)
- обслуживает SSL-сертификат (https)

Без Nginx пользователи обращались бы напрямую к Node.js на порту 3000, а это небезопасно.

```bash
apt install -y nginx
```

Сразу удалим дефолтную страницу Nginx ("Welcome to nginx!"), чтобы она не мешала:

```bash
rm -f /etc/nginx/sites-enabled/default
```

**Проверка:**

```bash
systemctl status nginx | head -5
```

**Ожидаемый результат:** `Active: active (running)`.

> **Частая ошибка:** если потом в браузере вместо сайта видите "Welcome to nginx!" — значит дефолтная страница не удалена. Выполните `rm -f /etc/nginx/sites-enabled/default && sudo systemctl restart nginx`.

---

### Шаг 9. Создать Swap (виртуальная память)

Зачем: при сборке Next.js (команда `npm run build`) приложение потребляет очень много памяти. Если на сервере 4 ГБ RAM — без swap сборка упадёт с ошибкой "out of memory" (KILLED). Swap использует диск как дополнительную RAM.

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Проверка:**

```bash
free -m | grep Swap
```

**Ожидаемый результат:** `Swap:   2047   ...` (примерно 2 ГБ). Если `Swap: 0 0 0` — swap не включился, повторите команды.

---

## Часть 2. Безопасность

> Все команды этой части выполняются **под root**. Мы настроим безопасность и только после этого отключим root-доступ.

---

### Шаг 10. Создать пользователя deploy

Зачем: работать под root опасно — любая ошибка может сломать систему. Создаём обычного пользователя для повседневной работы. Он будет иметь права sudo (может выполнять команды от root, но осознанно, с вводом `sudo`).

```bash
adduser deploy
```

Спросит пароль — придумайте и запомните (нужен для команд с `sudo`). Остальные поля (Full Name и т.д.) — просто жмите Enter.

Дать права sudo:

```bash
usermod -aG sudo deploy
```

**Проверка:**

```bash
id deploy
```

**Ожидаемый результат:** в выводе есть `sudo` — значит пользователь в группе sudo.

---

### Шаг 11. SSH-ключ для пользователя deploy

Зачем: вход по SSH-ключу вместо пароля. Ключ — это файл на вашем компьютере. Его невозможно подобрать перебором, в отличие от пароля.

#### На вашем компьютере (PowerShell)

Если ключ уже есть (создавали раньше) — пропустите первую команду.

```powershell
ssh-keygen -t ed25519 -C "server-access" -f "$env:USERPROFILE\.ssh\deploy_server"
```

Спросит passphrase — можно оставить пустым (просто Enter дважды).

Теперь покажем публичный ключ (его нужно скопировать):

```powershell
Get-Content "$env:USERPROFILE\.ssh\deploy_server.pub"
```

**Скопируйте всю строку** — она начинается с `ssh-ed25519 AAAA...`.

#### На сервере (под root)

Вставьте ваш публичный ключ вместо `ВСТАВЬТЕ_ПУБЛИЧНЫЙ_КЛЮЧ`:

```bash
mkdir -p /home/deploy/.ssh
echo "ВСТАВЬТЕ_ПУБЛИЧНЫЙ_КЛЮЧ" > /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

**Проверка** (на сервере):

```bash
cat /home/deploy/.ssh/authorized_keys
```

**Ожидаемый результат:** одна строка, начинающаяся с `ssh-ed25519`.

---

### Шаг 12. ПРОВЕРИТЬ вход как deploy (ВАЖНО!)

> **НЕ ЗАКРЫВАЙТЕ текущую root-сессию!** Откройте **новое** окно PowerShell.

Подключитесь:

```powershell
ssh -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100
```

**Ожидаемый результат:** вы попали на сервер и видите `deploy@...:~$`.

Проверьте sudo:

```bash
sudo whoami
```

Введите пароль deploy (из шага 10). **Ожидаемый результат:** `root`.

Если всё ОК — введите `exit` и вернитесь в root-сессию.

> **Если не подключилось:** проверьте, что ключ скопирован правильно (шаг 11). На сервере: `cat /home/deploy/.ssh/authorized_keys` должен содержать ваш публичный ключ.

---

### Шаг 13. Настроить Firewall (UFW)

Зачем: файрволл закрывает ВСЕ порты, кроме тех, которые мы явно разрешим. Это главная защита от майнеров — раньше они заходили через открытый порт Redis (6379) или Next.js (3000).

```bash
ufw allow 22/tcp
ufw allow 2222/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000
ufw deny 10050
ufw enable
```

Объяснение каждого правила:

- `22/tcp` — текущий SSH (мы его закроем позже, когда переключимся на 2222)
- `2222/tcp` — будущий SSH-порт
- `80/tcp` — HTTP (Nginx)
- `443/tcp` — HTTPS (Nginx + SSL)
- `deny 3000` — явно запрещаем доступ к Next.js напрямую (только через Nginx!)
- `deny 10050` — явно запрещаем Zabbix-агент Timeweb (не нужен)

На вопрос "Command may disrupt existing SSH connections" — ответьте `y`.

**Проверка:**

```bash
ufw status
```

**Ожидаемый результат:**

```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
2222/tcp                   ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
3000                       DENY        Anywhere
10050                      DENY        Anywhere
```

(+ аналогичные строки для IPv6)

---

### Шаг 14. Сменить SSH-порт на 2222

Зачем: стандартный порт 22 атакуют тысячи ботов ежедневно. Смена на нестандартный порт отсекает 99% автоматических атак. Боты не перебирают все 65535 портов — они бьют только в 22.

```bash
nano /etc/ssh/sshd_config
```

В открывшемся файле:

1. **Ctrl+W**, введите `Port`, Enter
2. Найдите строку `#Port 22` (или `Port 22`)
3. Замените на:

```
Port 2222
```

> **НЕ перезапускайте SSH пока!** Сначала следующий шаг.

---

### Шаг 15. Отключить root-логин и вход по паролю

Зачем:

- Отключение root — даже если кто-то узнает пароль root, он не сможет войти
- Отключение пароля — вход только по SSH-ключу, подбор пароля невозможен

В том же файле `/etc/ssh/sshd_config` (он уже открыт в nano) найдите и измените:

1. **Ctrl+W**, введите `PermitRootLogin`, Enter
2. Замените строку на:

```
PermitRootLogin no
```

3. **Ctrl+W**, введите `PasswordAuthentication`, Enter
4. Замените строку на:

```
PasswordAuthentication no
```

> **Убедитесь:** убрали `#` в начале строки (если был). Строка не должна начинаться с `#`.

Сохраните: **Ctrl+O** → Enter → **Ctrl+X**.

Теперь перезапускаем SSH:

```bash
systemctl restart sshd
```

---

### Шаг 16. ПРОВЕРИТЬ вход на новом порте (КРИТИЧЕСКИ ВАЖНО!)

> **НЕ ЗАКРЫВАЙТЕ текущую root-сессию!** Если что-то пойдёт не так — вы исправите через неё.

Откройте **новое** окно PowerShell:

```powershell
ssh -p 2222 -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100
```

**Ожидаемый результат:** вы подключились к серверу.

Проверьте, что root НЕ пускает:

```powershell
ssh -p 2222 root@62.113.44.100
```

**Ожидаемый результат:** `Permission denied` — правильно, root заблокирован.

> **Если НЕ подключилось:**
>
> 1. НЕ паникуйте — текущая root-сессия ещё открыта
> 2. В root-сессии: `nano /etc/ssh/sshd_config` и проверьте настройки
> 3. Убедитесь, что `Port 2222` (без `#`), `PermitRootLogin no` (без `#`), `PasswordAuthentication no` (без `#`)
> 4. Проверьте, что ключ добавлен: `cat /home/deploy/.ssh/authorized_keys`
> 5. Перезапустите: `systemctl restart sshd`
>
> **Страховка на крайний случай:** если всё сломалось и root-сессию закрыли — войдите через **VNC-консоль** в панели Timeweb (это как физический монитор, SSH не нужен).

---

### Шаг 17. Закрыть старый SSH-порт 22

Только после успешной проверки шага 16!

```bash
sudo ufw delete allow 22/tcp
```

**Проверка:**

```bash
sudo ufw status
```

**Ожидаемый результат:** строки с `22/tcp` больше нет. SSH работает только на 2222.

> Теперь **для всех** подключений к серверу используйте:
>
> ```powershell
> ssh -p 2222 -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100
> ```

---

### Шаг 18. Установить Fail2Ban

Зачем: автоматически блокирует IP-адреса, которые несколько раз ввели неправильный пароль/ключ. Защита от перебора.

```bash
sudo apt install -y fail2ban
```

Создать конфиг для нестандартного порта:

```bash
sudo bash -c 'cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = 2222
maxretry = 5
bantime = 3600
EOF'
```

Это значит: после 5 неудачных попыток входа за 10 минут — IP блокируется на 1 час.

```bash
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
```

**Проверка:**

```bash
sudo fail2ban-client status sshd
```

**Ожидаемый результат:** `Currently banned: 0`, `Total banned: 0` (пока никого не банили).

---

### Шаг 19. Автоматические обновления безопасности

Зачем: критические патчи (закрытие уязвимостей) будут устанавливаться автоматически, без вашего участия.

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

Появится диалог — выберите **Yes** (стрелками и Enter).

---

## Часть 3. Проект

> **С этого момента все команды выполняются как пользователь `deploy`.**
>
> Подключение:
>
> ```powershell
> ssh -p 2222 -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100
> ```

---

### Шаг 20. Клонировать проект с GitHub

```bash
cd ~
git clone https://github.com/ArtemChesnov/h-sport.git
cd h-sport
```

**Проверка:**

```bash
ls -la ~/h-sport/package.json
```

**Ожидаемый результат:** файл существует, показывает права и размер.

> Если репозиторий приватный, GitHub попросит логин и токен. Используйте Personal Access Token вместо пароля (GitHub → Settings → Developer settings → Personal access tokens).

---

### Шаг 21. Создать файл .env

Зачем: .env хранит все секретные настройки — пароли, ключи, адреса. Приложение читает их при запуске.

Сначала сгенерируйте AUTH_SECRET:

```bash
openssl rand -base64 32
```

**Запишите результат.**

Создайте файл:

```bash
nano ~/h-sport/.env
```

Вставьте содержимое ниже. **Замените** все значения в `< >` на свои:

```env
# ============================================
# H-Sport — Production .env
# ============================================

# ── ОБЯЗАТЕЛЬНЫЕ ──
# Пароль — тот, что задали в шаге 6 при CREATE USER
# ВАЖНО: адрес ОБЯЗАТЕЛЬНО localhost, а НЕ какой-нибудь db.prisma.io или cloud-адрес!
DATABASE_URL=postgresql://hsport:<ПАРОЛЬ_БД>@localhost:5432/hsport?schema=public
NODE_ENV=production

# Вставьте результат openssl rand -base64 32 (из команды выше)
# Без AUTH_SECRET приложение НЕ ЗАПУСТИТСЯ!
AUTH_SECRET=<ВАШЕ_ЗНАЧЕНИЕ>

# ── Приложение ──
NEXT_PUBLIC_APP_URL=https://h-brand.ru
AUTH_URL=https://h-brand.ru

# ── Администратор ──
# Этот email автоматически получает роль ADMIN при входе
ADMIN_EMAIL=jaksan37@gmail.com

# ── Email (SMTP) ──
# Без SMTP не работают: подтверждение email, сброс пароля, письмо о заказе
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=h.sportbrand@yandex.ru
SMTP_PASSWORD=<ПАРОЛЬ_SMTP>
SMTP_FROM="H-Sport <h.sportbrand@yandex.ru>"
SMTP_ALLOW_INSECURE_TLS=false

# ── Robokassa (оплата) ──
ROBOKASSA_MERCHANT_LOGIN=ваш_логин
ROBOKASSA_PASSWORD_1=пароль_1
ROBOKASSA_PASSWORD_2=пароль_2
ROBOKASSA_IS_TEST=false
ROBOKASSA_HASH_ALGORITHM=sha256

# ── CDEK (доставка) ──
CDEK_CLIENT_ID=ваш_cdek_id
CDEK_CLIENT_SECRET=ваш_cdek_secret
CDEK_IS_TEST=false
CDEK_FROM_CITY_CODE=137

# ── Почта России ──
POSTCALC_FROM_CITY="Нижний Новгород"
POSTCALC_KEY=test

# ── DaData (подсказки адресов) ──
DADATA_TOKEN=ваш_dadata_токен

# ── Доставка ──
DELIVERY_FEE_KOPECKS=30000

# ── База данных (тюнинг) ──
DB_POOL_MAX=10
DB_POOL_TIMEOUT_MS=5000

# ── Безопасность (CORS) ──
# Укажите реальный домен. НЕ используйте ALLOW_ANY_ORIGIN в production!
ALLOWED_ORIGINS=https://h-brand.ru

# ── Логирование ──
LOG_LEVEL=info
PRISMA_LOG_QUERIES=false
ENABLE_FILE_LOGGING=true
SLOW_QUERY_THRESHOLD_MS=1000

# ── Сборка ──
SKIP_INTEGRATION_TESTS=true
ENABLE_PRODUCT_PRE_RENDER=false
```

Сохранить: **Ctrl+O** → Enter → **Ctrl+X**.

**Проверка** — убедитесь, что файл создан и пароли подставлены:

```bash
grep "DATABASE_URL" ~/h-sport/.env
grep "AUTH_SECRET" ~/h-sport/.env
```

**Ожидаемый результат:** обе строки выводятся с вашими реальными значениями. Если видите `<ПАРОЛЬ_БД>` — вы забыли подставить реальный пароль.

> **Критически важно:**
>
> - `DATABASE_URL` — адрес `localhost`, а НЕ `db.prisma.io` или другой облачный адрес! Если скопировали .env из локальной разработки, там может быть адрес Prisma Cloud — его нужно заменить на `localhost`.
> - `AUTH_SECRET` — минимум 32 символа. Без него приложение не запустится.
> - `ROBOKASSA_HASH_ALGORITHM=sha256` — НЕ используйте `md5`, он криптографически слабый.

---

### Шаг 22. Установить зависимости

```bash
cd ~/h-sport
npm install
```

Ожидание: 1-3 минуты.

**Проверка:**

```bash
ls node_modules/.package-lock.json
```

**Ожидаемый результат:** файл существует.

---

### Шаг 23. Подготовить базу данных (миграции)

Зачем: Prisma создаёт таблицы в базе данных по схеме из файла `prisma/schema.prisma`. Без этого шага база пустая — нет таблиц Product, Order, User и т.д.

```bash
cd ~/h-sport
npx prisma generate
npx prisma migrate deploy
```

**Проверка:**

```bash
cd /tmp && sudo -u postgres psql hsport -c "\dt" | head -10
```

**Ожидаемый результат:** список таблиц — Product, Order, User, Category и другие. Если пусто — миграции не прошли.

> **Частая ошибка:** `Authentication failed against database server` — пароль в DATABASE_URL (файл .env) не совпадает с тем, что задали в шаге 6. Откройте `nano ~/h-sport/.env` и исправьте.
>
> **Ещё ошибка:** `Connection refused` — PostgreSQL не запущен. Выполните `sudo systemctl start postgresql`.

---

### Шаг 24. Собрать приложение (build)

Зачем: Next.js компилирует TypeScript, оптимизирует код, подготавливает всё для продакшена. Это самый ресурсоёмкий шаг — нужен swap (шаг 9).

```bash
cd ~/h-sport
NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

Ожидание: 3-7 минут. В процессе сервер будет нагружен — это нормально.

**Ожидаемый результат:** в конце вывода — `✓ Generating static pages` и без ошибок.

> **Если падает с "KILLED" или "out of memory":** swap не настроен (шаг 9) или мало памяти. Проверьте: `free -m` — в строке Swap должно быть ~2047.

---

### Шаг 25. Скопировать статику для standalone

Зачем: Next.js в режиме `standalone` (наш режим) не включает папки `static` и `public` в сборку — их нужно скопировать вручную. Без этого на сайте не будут работать CSS-стили и изображения.

```bash
cd ~/h-sport
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/
```

**Проверка:**

```bash
ls .next/standalone/.next/static && ls .next/standalone/public
```

**Ожидаемый результат:** содержимое обеих папок (CSS-файлы, изображения).

---

### Шаг 26. Запустить приложение через PM2

```bash
cd ~/h-sport
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
```

Последняя команда — настроить автозапуск при перезагрузке сервера:

```bash
pm2 startup
```

PM2 выведет команду, которую нужно **скопировать и выполнить** (она начинается с `sudo env PATH=...`). Выглядит примерно так:

```
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
```

**Скопируйте эту команду из вывода и вставьте в терминал.**

**Проверка:**

```bash
pm2 status
```

**Ожидаемый результат:** приложение `h-sport` со статусом `online`.

Проверим логи:

```bash
pm2 logs h-sport --lines 10 --nostream
```

**Ожидаемый результат:**

- `✓ Ready in ...ms` — приложение запустилось

> **Если в логах `Can't reach database server` или `Authentication failed`:**
> Проверьте `DATABASE_URL` в .env — пароль и адрес `localhost`.
>
> **Если в логах ошибка про AUTH_SECRET:**
> Убедитесь, что в .env задан `AUTH_SECRET` длиной не менее 32 символов.

Проверим, что приложение отвечает:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

**Ожидаемый результат:** `200`. Если `000` или другая ошибка — приложение не запустилось, смотрите логи: `pm2 logs h-sport --lines 30 --nostream`.

---

### Шаг 27. Заполнить базу данными (seed)

Зачем: добавляет в базу начальные данные — товары, категории, размеры, тестового пользователя. Без этого сайт будет пустым.

> **Выполняйте только при первой установке!** Если восстанавливаете из бэкапа — пропустите.

```bash
cd ~/h-sport
npm run prisma:seed
```

Ожидание: 30-60 секунд.

> **Если ошибка `The table 'public.OrderEvent' does not exist`:** миграции не прошли (шаг 23). Выполните `npx prisma migrate deploy`, потом повторите seed.

После сидирования перезапустите приложение, чтобы оно увидело новые данные:

```bash
pm2 delete h-sport && pm2 start ecosystem.config.cjs && pm2 save
```

**Проверка:**

```bash
curl -s http://localhost:3000 | grep -o '<title>[^<]*</title>'
```

**Ожидаемый результат:** `<title>H-Sport...</title>` (заголовок сайта).

---

## Часть 4. Nginx + SSL

---

### Шаг 28. Настроить Nginx

Зачем: Nginx принимает запросы из интернета (порты 80/443) и передаёт их приложению на localhost:3000. Снаружи виден только Nginx.

Создать конфигурацию:

```bash
sudo nano /etc/nginx/sites-available/h-brand.ru
```

Вставьте:

```nginx
server {
    listen 80;
    server_name h-brand.ru www.h-brand.ru 62.113.44.100;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Сохранить: **Ctrl+O** → Enter → **Ctrl+X**.

Включить сайт (создаём символическую ссылку):

```bash
sudo ln -s /etc/nginx/sites-available/h-brand.ru /etc/nginx/sites-enabled/
```

Убедиться, что дефолтный сайт удалён (повторно, на всякий случай):

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

Проверить конфигурацию на ошибки:

```bash
sudo nginx -t
```

**Ожидаемый результат:** `syntax is ok` и `test is successful`. Если ошибка — опечатка в конфиге, откройте и исправьте.

Перезапустить Nginx:

```bash
sudo systemctl restart nginx
```

**Проверка — список включённых сайтов:**

```bash
ls -la /etc/nginx/sites-enabled/
```

**Ожидаемый результат:** только `h-brand.ru`, без `default`.

**Проверка — Nginx отвечает:**

```bash
curl -s -o /dev/null -w "%{http_code}" -H "Host: h-brand.ru" http://127.0.0.1
```

**Ожидаемый результат:** `200`.

> **Частая ошибка:** в браузере отображается "Welcome to nginx!" вместо сайта.
> Причина: не удалён файл `/etc/nginx/sites-enabled/default`.
> Решение:
>
> ```bash
> sudo rm -f /etc/nginx/sites-enabled/default
> sudo systemctl restart nginx
> ```
>
> После этого **обязательно** очистите кеш браузера (**Ctrl+Shift+Delete**) или откройте страницу в **приватном/инкогнито** окне.

---

### Шаг 29. Проверить DNS

Зачем: домен `h-brand.ru` должен указывать на IP сервера `62.113.44.100`. Без этого браузер не знает, куда отправлять запрос.

DNS настраивается в панели управления доменом (где покупали домен). Нужна A-запись:

| Тип | Имя | Значение      |
| --- | --- | ------------- |
| A   | @   | 62.113.44.100 |
| A   | www | 62.113.44.100 |

Проверить, что DNS уже настроен:

```bash
dig +short h-brand.ru
```

**Ожидаемый результат:** `62.113.44.100`. Если пусто или другой IP — DNS не настроен или не обновился (может занять до 24 часов, обычно 5-30 минут).

Проверить с вашего компьютера (PowerShell):

```powershell
nslookup h-brand.ru
```

**Ожидаемый результат:** `Address: 62.113.44.100`.

Откройте в браузере `http://h-brand.ru`:

- Если видите сайт — отлично, переходите к SSL
- Если "Welcome to nginx!" — удалите дефолтный сайт (см. конец шага 28)
- Если "Сайт не найден" — DNS ещё не обновился, подождите
- Если сайт не загружается долго — попробуйте `http://62.113.44.100` напрямую

> **Если сайт работает по IP, но не по домену** — это DNS. Подождите или проверьте настройки домена.
>
> **Если в браузере ничего не открывается, но `curl` на сервере даёт 200** — это кеш браузера. Откройте в **приватном окне** или сделайте **Ctrl+Shift+R** (жёсткое обновление).

---

### Шаг 30. SSL-сертификат (HTTPS)

Зачем: SSL шифрует трафик между браузером и сервером. Без SSL:

- браузер показывает "Не безопасно"
- данные (пароли, заказы) передаются открытым текстом
- Google понижает сайт в поиске

> **Выполнять ТОЛЬКО после того, как `http://h-brand.ru` открывается в браузере!** Certbot проверяет, что домен указывает на сервер.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d h-brand.ru -d www.h-brand.ru
```

Certbot спросит:

1. Email — введите ваш (для уведомлений об истечении)
2. Согласие с условиями — `Y`
3. Рассылка — `N` (по желанию)
4. Редирект HTTP→HTTPS — выберите **2** (redirect)

**Проверка:**

```bash
systemctl list-timers | grep certbot
```

**Ожидаемый результат:** строка с `certbot.timer` — автопродление настроено.

Откройте в браузере `https://h-brand.ru` — должен быть замок в адресной строке.

---

## Часть 5. Автодеплой (GitHub Actions)

Зачем: при каждом push в ветку master GitHub автоматически подключается к серверу и обновляет код. Не нужно заходить на сервер вручную.

---

### Шаг 31. Создать SSH-ключ для GitHub Actions

Зачем: GitHub нужен отдельный SSH-ключ для подключения к серверу. Мы создаём его на сервере и даём приватную часть GitHub.

На сервере (как deploy):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""
```

Добавить публичный ключ в authorized_keys:

```bash
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Проверка:**

```bash
wc -l ~/.ssh/authorized_keys
```

**Ожидаемый результат:** 2 (два ключа — ваш личный и для GitHub).

Показать приватный ключ (его нужно скопировать в GitHub):

```bash
cat ~/.ssh/deploy_key
```

**Скопируйте ВЕСЬ вывод** — от `-----BEGIN OPENSSH PRIVATE KEY-----` до `-----END OPENSSH PRIVATE KEY-----` включительно. Ничего не пропустите!

---

### Шаг 32. Настроить GitHub Secrets и Variables

GitHub → ваш репозиторий → **Settings** → **Secrets and variables** → **Actions**.

#### Вкладка "Secrets" → "New repository secret":

| Имя               | Значение                  | Пояснение                              |
| ----------------- | ------------------------- | -------------------------------------- |
| `SSH_HOST`        | `62.113.44.100`           | IP сервера                             |
| `SSH_USER`        | `deploy`                  | Имя пользователя на сервере            |
| `SSH_PRIVATE_KEY` | _(содержимое deploy_key)_ | Весь текст из шага 31, от BEGIN до END |

#### Вкладка "Variables" → "New repository variable":

| Имя              | Значение               | Пояснение                 |
| ---------------- | ---------------------- | ------------------------- |
| `DEPLOY_ENABLED` | `true`                 | Включить автодеплой       |
| `DEPLOY_PATH`    | `/home/deploy/h-sport` | Путь к проекту на сервере |
| `SSH_PORT`       | `2222`                 | SSH-порт сервера          |

> **Частая ошибка:** `Permission denied (publickey,password)` при деплое.
> Причины:
>
> 1. Приватный ключ скопирован не полностью — скопируйте заново, включая `-----BEGIN` и `-----END`
> 2. Публичный ключ не добавлен в authorized_keys — проверьте на сервере: `cat ~/.ssh/authorized_keys` (должно быть 2 строки)
> 3. SSH_USER не совпадает с именем пользователя на сервере
> 4. SSH_PORT не `2222`

---

### Шаг 33. Проверить автодеплой

На своём компьютере:

```bash
git commit --allow-empty -m "test deploy" && git push
```

Откройте GitHub → ваш репозиторий → **Actions** → последний запуск "Deploy to production".

**Ожидаемый результат:** зелёная галочка, в логах `=== Deploy done ===`.

> **Если ошибка с SSH:** см. раздел "Частая ошибка" в шаге 32.
>
> **Если деплой зависает (0s execution time):** проблема с `.bashrc` на сервере. На сервере проверьте, что файл `/home/deploy/.bashrc` не содержит подозрительных строк:
>
> ```bash
> cat ~/.bashrc
> ```
>
> Он должен содержать только стандартные настройки bash. Если видите странные строки (base64, curl, wget на непонятные URL) — это вредоносный код, удалите их.

---

## Справочник команд

Шпаргалка на каждый день. Все команды выполняются на сервере.

### Подключение к серверу

```powershell
ssh -p 2222 -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100
```

### Приложение (PM2)

```bash
# Статус (запущено ли, память, uptime)
pm2 list

# Последние 20 строк логов
pm2 logs h-sport --lines 20 --nostream

# Логи в реальном времени (выход — Ctrl+C)
pm2 logs h-sport

# Перезапуск (ОБЯЗАТЕЛЬНО через delete + start после правки .env!)
cd ~/h-sport && pm2 delete h-sport && pm2 start ecosystem.config.cjs && pm2 save

# Остановить
pm2 stop h-sport

# Мониторинг CPU и памяти в реальном времени (выход — Ctrl+C)
pm2 monit
```

> **Почему `pm2 delete + start`, а не `pm2 restart`?**
> При `restart` PM2 использует старые переменные окружения. Только `delete + start` заставляет `ecosystem.config.cjs` перечитать файл .env. Если изменили .env — всегда через delete + start.

### Код на сервере

```bash
# Последний коммит
git -C ~/h-sport log --oneline -1

# Последние 5 коммитов
git -C ~/h-sport log --oneline -5

# Есть ли незадеплоенные коммиты
cd ~/h-sport && git fetch origin && git log --oneline HEAD..origin/master
```

### Ручной деплой

```bash
cd ~/h-sport && bash scripts/server-deploy.sh
```

### Память, CPU, диск

```bash
# RAM и Swap
free -m

# Загрузка CPU (выход — q)
top

# Место на диске
df -h /

# Что занимает больше всего
du -sh ~/h-sport/node_modules ~/h-sport/.next 2>/dev/null
```

### База данных (PostgreSQL)

```bash
# Количество товаров / заказов / пользователей
cd /tmp && sudo -u postgres psql hsport -c 'SELECT COUNT(*) FROM "Product";'
cd /tmp && sudo -u postgres psql hsport -c 'SELECT COUNT(*) FROM "Order";'
cd /tmp && sudo -u postgres psql hsport -c 'SELECT COUNT(*) FROM "User";'

# Бэкап базы данных
cd /tmp && sudo -u postgres pg_dump hsport > /tmp/hsport_backup.sql
ls -lh /tmp/hsport_backup.sql
```

Скачать бэкап на свой компьютер (PowerShell):

```powershell
scp -P 2222 -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100:/tmp/hsport_backup.sql C:\Users\CHE\Desktop\
```

### Безопасность

```bash
# Статус firewall
sudo ufw status

# Fail2Ban — сколько IP заблокировано
sudo fail2ban-client status sshd

# Кто подключался по SSH
last -10

# Текущие SSH-сессии
who

# Проверка на подозрительные процессы (топ по CPU)
ps aux --sort=-%cpu | head -15

# Проверка cron (должен быть пустой для deploy)
crontab -l

# Открытые порты
sudo ss -tlnp
```

### SSL-сертификат

```bash
# Автопродление (должен быть certbot.timer)
systemctl list-timers | grep certbot

# Принудительно продлить
sudo certbot renew

# Когда истекает
sudo certbot certificates
```

### Nginx

```bash
# Проверить конфиг (должно быть "syntax is ok")
sudo nginx -t

# Перезапустить
sudo systemctl restart nginx

# Логи ошибок
sudo tail -20 /var/log/nginx/error.log
```

### .env (переменные окружения)

```bash
# Посмотреть
cat ~/h-sport/.env

# Редактировать
nano ~/h-sport/.env

# ОБЯЗАТЕЛЬНО после изменения .env:
cd ~/h-sport && pm2 delete h-sport && pm2 start ecosystem.config.cjs && pm2 save
```

### Быстрая диагностика (всё сразу)

```bash
echo "=== PM2 ===" && pm2 list && echo "" && echo "=== Memory ===" && free -m && echo "" && echo "=== Disk ===" && df -h / && echo "" && echo "=== Last commit ===" && git -C ~/h-sport log --oneline -1 && echo "" && echo "=== UFW ===" && sudo ufw status && echo "" && echo "=== SSL ===" && sudo certbot certificates 2>/dev/null | grep -E "Expiry|Domains" && echo "" && echo "=== Fail2Ban ===" && sudo fail2ban-client status sshd 2>/dev/null | grep "Currently banned" && echo "" && echo "=== Top CPU ===" && ps aux --sort=-%cpu | head -10
```

---

## FAQ (Частые проблемы)

### Браузер показывает "Welcome to nginx!" вместо сайта

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

Потом в браузере: **Ctrl+Shift+R** или откройте в **приватном окне**.

### Браузер показывает "Сайт не найден"

DNS ещё не обновился. Проверьте: `dig +short h-brand.ru` — должно быть `62.113.44.100`. Подождите 5-30 минут.

### В логах PM2: `Can't reach database server` или `Authentication failed`

Неправильный DATABASE_URL в .env:

```bash
grep DATABASE_URL ~/h-sport/.env
```

Должно быть: `postgresql://hsport:пароль@localhost:5432/hsport?schema=public`. Адрес — **localhost**, а не какой-то облачный URL.

### В логах PM2: `The table does not exist`

Миграции не применены:

```bash
cd ~/h-sport && npx prisma migrate deploy
pm2 delete h-sport && pm2 start ecosystem.config.cjs && pm2 save
```

### GitHub Actions: `Permission denied (publickey,password)`

1. Проверьте SSH_PRIVATE_KEY в GitHub Secrets — весь текст от `-----BEGIN` до `-----END`
2. Проверьте на сервере: `cat ~/.ssh/authorized_keys` — должно быть минимум 2 строки
3. Проверьте SSH_USER в GitHub Secrets — `deploy`
4. Проверьте SSH_PORT в GitHub Variables — `2222`

### Не могу подключиться к серверу по SSH

```powershell
ssh -p 2222 -v -i "$env:USERPROFILE\.ssh\deploy_server" deploy@62.113.44.100
```

Флаг `-v` покажет подробный лог подключения. Частые причины:

- Неправильный порт (должен быть 2222)
- Неправильный путь к ключу
- Ключ не добавлен на сервер

**Крайний вариант:** войдите через VNC-консоль в панели Timeweb и проверьте `/etc/ssh/sshd_config`.

### Сборка (`npm run build`) падает с KILLED

Не хватает памяти. Проверьте swap:

```bash
free -m
```

Если Swap: 0 — создайте (шаг 9). Если PM2 с приложением работает — остановите на время сборки:

```bash
pm2 stop h-sport
NODE_OPTIONS="--max-old-space-size=1536" npm run build
pm2 start ecosystem.config.cjs
```

### Как обновить .env и перезапустить

```bash
nano ~/h-sport/.env
# ... вносите изменения ...
cd ~/h-sport && pm2 delete h-sport && pm2 start ecosystem.config.cjs && pm2 save
pm2 logs h-sport --lines 5 --nostream
```

### Как проверить, что нет майнера

Майнер — вредоносная программа, которая тайно использует ваш сервер для добычи криптовалюты. Признаки: CPU загружен на 100% постоянно, сервер тормозит, сайт еле открывается. Проверяйте периодически (раз в неделю достаточно).

#### 1. Загрузка CPU (главный признак)

```bash
ps aux --sort=-%cpu | head -10
```

**Норма:** ни один процесс не жрёт больше 5-10% CPU в простое. Node.js (приложение) обычно 0-3%.

**Плохо:** какой-то непонятный процесс с именами типа `kdevtmpfsi`, `kinsing`, `xmrig`, `ld-linux`, `.x`, `rsync` (фейковый), `[kworker]` (фейковый) грузит CPU на 80-100%.

```bash
top -bn1 | head -20
```

Посмотрите строку `%Cpu(s):` — `us` (user) + `sy` (system) в простое должно быть < 10%. Если 80%+ — что-то не так.

#### 2. Crontab (автозапуск по расписанию)

Майнеры часто прописывают себя в cron, чтобы перезапускаться после удаления.

```bash
crontab -l
sudo crontab -l
```

**Норма:** `no crontab for deploy` / `no crontab for root` (пусто).

**Плохо:** любые строки с `curl`, `wget`, `base64`, `/tmp/`, `/dev/shm/`, непонятные URL.

Проверить все cron-директории:

```bash
ls -la /etc/cron.d/ /var/spool/cron/crontabs/
```

**Норма:** в `/etc/cron.d/` только системные файлы (e2scrub_all, certbot и т.д.). В `crontabs/` — пусто или нет такой папки.

#### 3. Файл .bashrc (запуск при входе)

Майнеры прописывают запуск в `.bashrc` — тогда вредоносный код выполняется при каждом SSH-подключении (даже при деплое через GitHub Actions!).

```bash
cat ~/.bashrc
```

**Норма:** стандартные настройки bash (alias, цвета, prompt). Обычно 100-120 строк.

**Плохо:** в конце файла — длинные строки с `base64 -d`, `curl`, `wget`, `eval`, `/dev/shm/`, `/tmp/.X11`, непонятные URL.

Проверить и root:

```bash
sudo cat /root/.bashrc
```

#### 4. Скрытые процессы через LD_PRELOAD

Продвинутые майнеры используют `libprocesshider.so` — библиотеку, которая скрывает процесс из `ps` и `top`. Проверьте:

```bash
cat /etc/ld.so.preload 2>/dev/null
```

**Норма:** `No such file or directory` или пустой файл.

**Плохо:** любое содержимое (например `/usr/local/lib/libprocesshider.so`).

```bash
ls -la /usr/local/lib/libprocess* 2>/dev/null
```

**Норма:** `No such file or directory`.

#### 5. Открытые порты

```bash
sudo ss -tlnp
```

**Норма** (только эти порты):

| Порт | Процесс  | Адрес                        |
| ---- | -------- | ---------------------------- |
| 2222 | sshd     | 0.0.0.0                      |
| 80   | nginx    | 0.0.0.0                      |
| 443  | nginx    | 0.0.0.0                      |
| 3000 | node     | 0.0.0.0 (но закрыт в UFW)    |
| 5432 | postgres | 127.0.0.1 (только localhost) |

**Плохо:** любой незнакомый порт или процесс.

#### 6. Подозрительные файлы в /tmp и /dev/shm

Майнеры часто складывают свои файлы в эти папки:

```bash
ls -la /tmp/ /dev/shm/ /var/tmp/
```

**Норма:** мало файлов, все понятные (systemd-private-..., npm-...).

**Плохо:** исполняемые файлы с подозрительными именами, файлы с правами `rwxrwxrwx`.

```bash
find /tmp /dev/shm /var/tmp -type f -executable 2>/dev/null
```

**Норма:** пусто.

#### 7. Атрибуты файлов (chattr)

Майнеры могут защитить свои файлы от удаления через immutable-атрибут:

```bash
sudo lsattr /etc/ld.so.preload 2>/dev/null
sudo lsattr /etc/cron.d/ 2>/dev/null
```

**Норма:** `----i---------` НЕ должно быть. Если есть `i` — файл защищён от изменений.

Снять защиту (если нашли):

```bash
sudo chattr -i /путь/к/файлу
```

#### 8. Одна команда — полная проверка

Скопируйте и выполните целиком:

```bash
echo "=== CPU TOP ===" && ps aux --sort=-%cpu | head -8 && echo "" && echo "=== CRONTAB (deploy) ===" && crontab -l 2>&1 && echo "" && echo "=== CRONTAB (root) ===" && sudo crontab -l 2>&1 && echo "" && echo "=== LD_PRELOAD ===" && cat /etc/ld.so.preload 2>&1 && echo "" && echo "=== PORTS ===" && sudo ss -tlnp && echo "" && echo "=== /tmp executables ===" && find /tmp /dev/shm /var/tmp -type f -executable 2>/dev/null && echo "(none = ok)" && echo "" && echo "=== .bashrc last 3 lines (deploy) ===" && tail -3 ~/.bashrc && echo "" && echo "=== .bashrc last 3 lines (root) ===" && sudo tail -3 /root/.bashrc
```

**Если всё чисто:**

- CPU < 10%
- Crontab пустой
- ld.so.preload нет
- Порты только знакомые
- /tmp без исполняемых файлов
- .bashrc без подозрительного кода

**Если нашли майнер:**

1. Не паникуйте
2. Сохраните бэкап базы: `cd /tmp && sudo -u postgres pg_dump hsport > /tmp/hsport_backup.sql`
3. Скачайте бэкап и .env на свой компьютер
4. Переустановите ОС через Timeweb
5. Выполните эту инструкцию с нуля
