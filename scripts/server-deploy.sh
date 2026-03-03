#!/bin/bash
# Скрипт деплоя: pull, зависимости, миграции, сборка, перезапуск PM2.
# Запускается автоматически через GitHub Actions или вручную: bash scripts/server-deploy.sh
# Требует: git, node, npm, pm2, настроенный .env и swap (создаётся при установке сервера).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."
APP_DIR="$(pwd)"
PM2_APP_NAME="${PM2_APP_NAME:-h-sport}"
BRANCH="${BRANCH:-master}"

export PATH="/usr/local/bin:/usr/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

echo "=== Deploy $APP_DIR (branch: $BRANCH) ==="

git fetch origin
git reset --hard "origin/$BRANCH"

npm install

npx prisma generate
npx prisma migrate deploy

if command -v pm2 >/dev/null 2>&1; then
  pm2 stop "$PM2_APP_NAME" 2>/dev/null || true
  echo "[deploy] PM2 app stopped to free RAM for build"
fi

NODE_OPTIONS="--max-old-space-size=1536" npm run build

if [ -d ".next/standalone" ]; then
  cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
  [ -d "public" ] && cp -r public .next/standalone/ 2>/dev/null || true
fi

if command -v pm2 >/dev/null 2>&1; then
  pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
  pm2 start ecosystem.config.cjs
  pm2 save
  echo "[deploy] PM2 restarted: $PM2_APP_NAME"
else
  echo "PM2 not found. Start app manually: node .next/standalone/server.js"
fi

echo "=== Deploy done ==="
