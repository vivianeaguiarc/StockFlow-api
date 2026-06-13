#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUPS_DIR="$PROJECT_ROOT/backups"

load_dotenv() {
  local env_file="$1"

  if [ ! -f "$env_file" ]; then
    return 0
  fi

  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      '' | \#*) continue ;;
      *=*)
        local key="${line%%=*}"
        local value="${line#*=}"

        key="$(echo "$key" | xargs)"
        value="$(echo "$value" | xargs)"

        export "$key=$value"
        ;;
    esac
  done < "$env_file"
}

parse_database_url() {
  if [ -z "${DATABASE_URL:-}" ]; then
    return 0
  fi

  eval "$(
    node -e "
      const raw = process.env.DATABASE_URL;
      const normalized = raw.replace(/^postgresql:/, 'http:').replace(/^postgres:/, 'http:');
      const url = new URL(normalized);
      const dbName = url.pathname.replace(/^\\//, '').split('?')[0];

      const emit = (key, value) => {
        console.log(\`\${key}=\${JSON.stringify(value)}\`);
      };

      emit('DB_HOST', url.hostname);
      emit('DB_PORT', url.port || '5432');
      emit('POSTGRES_USER', decodeURIComponent(url.username));
      emit('POSTGRES_PASSWORD', decodeURIComponent(url.password));
      emit('POSTGRES_DB', dbName);
    "
  )"
}

load_db_env() {
  load_dotenv "$PROJECT_ROOT/.env"
  parse_database_url

  export POSTGRES_USER="${POSTGRES_USER:-stockflow}"
  export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-stockflow}"
  export POSTGRES_DB="${POSTGRES_DB:-stockflow_db}"
  export DB_HOST="${DB_HOST:-localhost}"
  export DB_PORT="${DB_PORT:-5432}"
}

is_docker_postgres_running() {
  if ! command -v docker >/dev/null 2>&1; then
    return 1
  fi

  docker compose -f "$PROJECT_ROOT/docker-compose.yml" ps postgres --status running -q 2>/dev/null | grep -q .
}

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Error: '$command_name' is not installed or not in PATH." >&2
    exit 1
  fi
}
