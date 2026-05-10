#!/usr/bin/env bash
# Pull latest code, build, and reload the app.
# Run on the server: cd /var/www/uzmanrot && bash deploy/deploy.sh

set -euo pipefail

APP_DIR="/var/www/uzmanrot"
APP_NAME="uzmanrot"

cd "$APP_DIR"

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing dependencies"
npm ci

echo "==> Pushing DB schema"
npm run db:push

echo "==> Building Next.js (standalone)"
npm run build

echo "==> Copying static and public assets into standalone"
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -r public .next/standalone/public

echo "==> Linking SQLite db into standalone working dir"
ln -sf "$APP_DIR/uzmanrot.db" .next/standalone/uzmanrot.db
[ -f uzmanrot.db-shm ] && ln -sf "$APP_DIR/uzmanrot.db-shm" .next/standalone/uzmanrot.db-shm || true
[ -f uzmanrot.db-wal ] && ln -sf "$APP_DIR/uzmanrot.db-wal" .next/standalone/uzmanrot.db-wal || true

echo "==> Linking .env.production into standalone"
ln -sf "$APP_DIR/.env.production" .next/standalone/.env.production
ln -sf "$APP_DIR/.env.production" .next/standalone/.env.local

echo "==> Reloading PM2 app: $APP_NAME"
pm2 reload "$APP_NAME" --update-env || pm2 start deploy/ecosystem.config.js

pm2 save
echo "==> Done."
