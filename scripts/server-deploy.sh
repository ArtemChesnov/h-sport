#!/bin/bash
# Скрипт деплоя на сервере: pull, установка зависимостей, миграции, сборка, перезапуск PM2.
# Запускать из корня проекта на сервере: ./scripts/server-deploy.sh
# Требует: git, node, npm, pm2, настроенный .env. Ветка по умолчанию master (совпадает с GitHub Actions).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."
APP_DIR="$(pwd)"
PM2_APP_NAME="${PM2_APP_NAME:-h-sport}"
BRANCH="${BRANCH:-master}"

echo "=== Deploy $APP_DIR (branch: $BRANCH) ==="

git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build

# Перезапуск PM2 (имя приложения по умолчанию h-sport)
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
  echo "PM2 restarted: $PM2_APP_NAME"
else
  echo "PM2 not found. Restart app manually (e.g. node .next/standalone/server.js)"
fi

echo "=== Deploy done ==="
