#!/bin/bash
# Бэкап PostgreSQL. Запуск: ./scripts/backup-db.sh
# На сервере задайте в .env переменную DATABASE_URL или PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/h-sport}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  source "$PROJECT_ROOT/.env"
  set +a
fi

if [ -z "$DATABASE_URL" ] && [ -z "$PGHOST" ]; then
  echo "ERROR: DATABASE_URL or PGHOST not set"
  exit 1
fi

FILE="$BACKUP_DIR/hsport_$(date +%Y%m%d_%H%M).dump"

if [ -n "$DATABASE_URL" ]; then
  pg_dump "$DATABASE_URL" -F c -f "$FILE"
else
  pg_dump -h "${PGHOST:-localhost}" -p "${PGPORT:-5432}" -U "$PGUSER" -d "${PGDATABASE:-hsport}" -F c -f "$FILE"
fi

echo "Backup saved: $FILE"

# Удалить старые бэкапы
find "$BACKUP_DIR" -name "hsport_*.dump" -mtime +"$RETENTION_DAYS" -delete 2>/dev/null || true
