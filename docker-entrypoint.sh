#!/bin/sh

set -e

echo "Running database migrations..."

pnpm db:migrate:deploy

echo "Starting StockFlow API..."

exec "$@"