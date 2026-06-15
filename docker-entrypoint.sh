#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."

attempt=0
max_attempts=30

until pnpm db:migrate:deploy; do
  attempt=$((attempt + 1))

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database migrations failed after ${max_attempts} attempts."
    exit 1
  fi

  echo "Database not ready yet. Retrying in 2s (${attempt}/${max_attempts})..."
  sleep 2
done

echo "Starting StockFlow API..."

if [ "$NODE_ENV" = "production" ] && [ ! -f "dist/server.js" ]; then
  echo "ERROR: dist/server.js not found. Production image must run 'pnpm build' before start."
  exit 1
fi

exec "$@"
