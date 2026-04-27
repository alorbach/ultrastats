#!/bin/sh
# Install wizard E2E: no config.php generation, no schema seed — empty DB only.
set -e
cd /var/www/html

# Non-empty config.php blocks the installer. By default (see compose) we stash it on the bind mount
# so local runs work without manual rename. CI has no config.php, so this is a no-op there.
if [ -f config.php ] && [ -s config.php ]; then
  if [ "${ULTRASTATS_INSTALL_E2E_STASH_CONFIG:-0}" = "1" ]; then
    mv -f config.php config.php.ultrastats-e2e-stash
    echo "ULTRASTATS INSTALL E2E: stashed config.php -> config.php.ultrastats-e2e-stash"
    echo "  After the test: keep the new config.php, or restore: mv -f config.php.ultrastats-e2e-stash config.php"
  else
    echo "ULTRASTATS INSTALL E2E: config.php exists and is non-empty."
    echo "Rename or remove src/config.php, or set ULTRASTATS_INSTALL_E2E_STASH_CONFIG=1 on the web service."
    exit 1
  fi
fi

DB_HOST="${ULTRASTATS_DB_HOST:-db}"
DB_PORT="${ULTRASTATS_DB_PORT:-3306}"
DB_NAME="${ULTRASTATS_DB_NAME:-ultrastats_e2e}"
DB_USER="${ULTRASTATS_DB_USER:-ultrastats}"
DB_PASS="${ULTRASTATS_DB_PASS:-ultrastats}"

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
i=0
while [ "$i" -lt 60 ]; do
  if php -r "mysqli_connect('${DB_HOST}', '${DB_USER}', '${DB_PASS}', '${DB_NAME}', (int)${DB_PORT}) or exit(1); exit(0);" 2>/dev/null; then
    echo "MySQL is up."
    break
  fi
  i=$((i + 1))
  sleep 1
done
if [ "$i" -ge 60 ]; then
  echo "ERROR: MySQL not reachable at ${DB_HOST}:${DB_PORT}"
  exit 1
fi

exec php -S 0.0.0.0:8091 -t /var/www/html
