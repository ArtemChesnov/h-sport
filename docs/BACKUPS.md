# Бэкапы на продакшене

## Что бэкапить

- **PostgreSQL** — основная БД (заказы, пользователи, товары, промокоды и т.д.). Обязательно.
- **Redis** — кеш и счётчики rate limit. Восстанавливать обычно не требуется; при падении Redis приложение продолжит работать (in-memory fallback для лимитов). По желанию можно не бэкапить или делать реже.

## Бэкап PostgreSQL

### Ручной бэкап (один раз)

Из `DATABASE_URL` возьмите хост, порт, имя пользователя, базу. Пример для локального PostgreSQL:

```bash
# Формат: pg_dump -h HOST -p PORT -U USER -d DBNAME -F c -f файл.dump
# -F c = custom format (удобно для restore)

pg_dump -h localhost -p 5432 -U postgres -d hsport -F c -f /var/backups/h-sport/hsport_$(date +%Y%m%d_%H%M).dump
```

Каталог для бэкапов создайте заранее, например: `sudo mkdir -p /var/backups/h-sport && sudo chown deploy:deploy /var/backups/h-sport`.

### Автоматический бэкап по расписанию (cron)

1. Создайте скрипт на сервере (например `/home/deploy/h-sport/scripts/backup-db.sh`):

```bash
#!/bin/bash
set -e
BACKUP_DIR="/var/backups/h-sport"
mkdir -p "$BACKUP_DIR"

# Из .env в корне проекта (или задайте переменные здесь)
source /home/deploy/h-sport/.env 2>/dev/null || true

# Парсим DATABASE_URL: postgresql://user:password@host:port/dbname
# Упрощённо — если формат стандартный:
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set"
  exit 1
fi

# Вариант: использовать pg_dump с URL (PostgreSQL 11+)
FILE="$BACKUP_DIR/hsport_$(date +%Y%m%d_%H).dump"
pg_dump "$DATABASE_URL" -F c -f "$FILE"

# Удалить бэкапы старше 7 дней
find "$BACKUP_DIR" -name "hsport_*.dump" -mtime +7 -delete
```

2. Сделайте скрипт исполняемым: `chmod +x /home/deploy/h-sport/scripts/backup-db.sh`.

3. Добавьте в crontab (каждый день в 3:00):

```bash
0 3 * * * /home/deploy/h-sport/scripts/backup-db.sh >> /var/log/h-sport-backup.log 2>&1
```

Если пароль в `DATABASE_URL` содержит спецсимволы, надёжнее использовать переменные `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` (задать в `.env` или в самом скрипте) и вызывать `pg_dump` без URL.

### Восстановление из бэкапа

```bash
# Остановить приложение (PM2)
pm2 stop h-sport

# Восстановить (перезаписать базу)
pg_restore -h localhost -p 5432 -U postgres -d hsport --clean --if-exists /var/backups/h-sport/hsport_YYYYMMDD_HH.dump

# Запустить приложение
pm2 start h-sport
```

Используйте тот же хост/порт/пользователь/базу, что и в `DATABASE_URL`.

## Резюме

| Действие | Команда / шаг |
|----------|----------------|
| Каталог для бэкапов | `mkdir -p /var/backups/h-sport` |
| Один раз вручную | Запустить `scripts/backup-db.sh` или свою команду `pg_dump` |
| Каждый день по расписанию | Добавить в cron вызов `scripts/backup-db.sh` |
| Хранить | Например последние 7 дней (как в примере скрипта) |

Почту для уведомлений при ошибке бэкапа можно добавить в скрипт (например, отправка письма при ненулевом exit code), когда будет доступ к SMTP.
