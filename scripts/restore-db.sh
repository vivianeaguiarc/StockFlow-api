#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_load-env.sh
source "$SCRIPT_DIR/_load-env.sh"

usage() {
  cat <<EOF
Usage: pnpm db:restore <backup-file>

Examples:
  pnpm db:restore backups/stockflow_db_20260613_120000.dump
  pnpm db:restore backups/stockflow_db_20260613_120000.sql

Supported formats:
  - .dump  PostgreSQL custom format (pg_dump -F c)
  - .sql   Plain SQL dump
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Error: backup file path is required." >&2
  echo >&2
  usage >&2
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

load_db_env

echo "WARNING: this will overwrite data in database '$POSTGRES_DB'."
echo "Backup file: $BACKUP_FILE"
echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

restore_with_docker() {
  if [[ "$BACKUP_FILE" == *.sql ]]; then
    docker compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres \
      psql \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      -v ON_ERROR_STOP=1 \
      < "$BACKUP_FILE"
  else
    docker compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres \
      pg_restore \
      --clean \
      --if-exists \
      --no-owner \
      --no-privileges \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      < "$BACKUP_FILE"
  fi
}

restore_with_local_tools() {
  if [[ "$BACKUP_FILE" == *.sql ]]; then
    require_command psql

    PGPASSWORD="$POSTGRES_PASSWORD" psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      -v ON_ERROR_STOP=1 \
      -f "$BACKUP_FILE"
  else
    require_command pg_restore

    PGPASSWORD="$POSTGRES_PASSWORD" pg_restore \
      --clean \
      --if-exists \
      --no-owner \
      --no-privileges \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$POSTGRES_USER" \
      -d "$POSTGRES_DB" \
      "$BACKUP_FILE"
  fi
}

echo "Restoring PostgreSQL backup..."
echo "Database: $POSTGRES_DB"

if is_docker_postgres_running; then
  echo "Mode: Docker Compose (postgres service)"
  restore_with_docker
else
  echo "Mode: local client ($DB_HOST:$DB_PORT)"
  restore_with_local_tools
fi

echo "Restore completed successfully."
