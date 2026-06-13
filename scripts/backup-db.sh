#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_load-env.sh
source "$SCRIPT_DIR/_load-env.sh"

load_db_env
mkdir -p "$BACKUPS_DIR"

TIMESTAMP="$(date -u +"%Y%m%d_%H%M%S")"
BACKUP_FILE="$BACKUPS_DIR/${POSTGRES_DB}_${TIMESTAMP}.dump"

echo "Creating PostgreSQL backup..."
echo "Database: $POSTGRES_DB"
echo "Output:   $BACKUP_FILE"

if is_docker_postgres_running; then
  echo "Mode: Docker Compose (postgres service)"

  docker compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres \
    pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -F c \
    > "$BACKUP_FILE"
else
  echo "Mode: local pg_dump ($DB_HOST:$DB_PORT)"
  require_command pg_dump

  PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    -F c \
    -f "$BACKUP_FILE"
fi

echo "Backup completed successfully."
echo "Restore with: pnpm db:restore $BACKUP_FILE"
