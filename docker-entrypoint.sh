#!/bin/sh
set -e

echo "➜ Running database migrations..."
npm run db:migrate

echo "➜ Seeding database (skipped if data exists)..."
npm run db:seed

echo "➜ Starting application..."
exec node .output/server/index.mjs
