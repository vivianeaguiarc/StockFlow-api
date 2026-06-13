#!/bin/sh
set -e

echo "Running database migrations..."
prisma migrate deploy

echo "Starting StockFlow API..."
exec "$@"
