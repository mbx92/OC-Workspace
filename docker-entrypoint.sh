#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
	echo "DATABASE_URL is not set"
	exit 1
fi

echo "➜ Waiting for database..."
attempt=1
until psql "$DATABASE_URL" -c 'select 1' >/dev/null 2>&1; do
	if [ "$attempt" -ge 30 ]; then
		echo "Database is not reachable after 30 attempts"
		exit 1
	fi

	echo "  Database not ready yet (attempt $attempt/30)"
	attempt=$((attempt + 1))
	sleep 2
done

echo "➜ Running database migrations..."
npm run db:migrate

echo "➜ Seeding database (skipped if data exists)..."
npm run db:seed

echo "➜ Starting application..."
exec node .output/server/index.mjs
