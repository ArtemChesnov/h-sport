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

# ── Swap: создаём 2 ГБ swap-файл, если его ещё нет ──
if [ ! -f /swapfile ]; then
  echo "[deploy] Creating 2G swap..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "[deploy] Swap created and enabled"
elif ! swapon --show | grep -q /swapfile; then
  swapon /swapfile 2>/dev/null || true
fi
echo "[deploy] Swap: $(swapon --show --noheadings 2>/dev/null || echo 'none')"

git fetch origin
git reset --hard "origin/$BRANCH"

npm install

npx prisma generate
npx prisma migrate deploy

# ── Останавливаем приложение перед сборкой, чтобы освободить ~300 МБ RAM ──
if command -v pm2 >/dev/null 2>&1; then
  pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
  echo "[deploy] PM2 app stopped to free RAM for build"
fi

# ── Сборка с ограничением памяти ──
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Standalone: скопировать статику и public в .next/standalone (нужно для работы сайта)
if [ -d ".next/standalone" ]; then
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
  [ -d "public" ] && cp -r public .next/standalone/ 2>/dev/null || true
fi

# ── Запускаем приложение ──
if command -v pm2 >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
  echo "[deploy] PM2 restarted: $PM2_APP_NAME"
else
  echo "PM2 not found. Restart app manually (e.g. node .next/standalone/server.js)"
fi

echo "=== Deploy done ==="
