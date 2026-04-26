#!/bin/sh
set -e
cd /var/www/html

DB_HOST="${ULTRASTATS_DB_HOST:-db}"
DB_PORT="${ULTRASTATS_DB_PORT:-3306}"
DB_NAME="${ULTRASTATS_DB_NAME:-ultrastats}"
DB_USER="${ULTRASTATS_DB_USER:-ultrastats}"
DB_PASS="${ULTRASTATS_DB_PASS:-ultrastats}"
TBPREF="${ULTRASTATS_TBPREF:-stats_}"

if [ -f "contrib/config.sample.php" ] && { [ ! -f "config.php" ] || [ "${ULTRASTATS_OVERWRITE_CONFIG:-0}" = "1" ]; }; then
  cat > config.php <<EOF
<?php
/*
 * Auto-generated for Docker local development. Do not use in production as-is.
 */
\$CFG['DBServer'] = '${DB_HOST}';
\$CFG['Port'] = ${DB_PORT};
\$CFG['DBName'] = '${DB_NAME}';
\$CFG['TBPref'] = '${TBPREF}';
\$CFG['User'] = '${DB_USER}';
\$CFG['Pass'] = '${DB_PASS}';
\$CFG['ShowPageRenderStats'] = 0;
\$CFG['ShowDebugMsg'] = 0;

?>
EOF
  echo "Wrote config.php for MySQL at ${DB_HOST}:${DB_PORT}."
fi

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
  echo "Warning: MySQL not reachable; PHP server will still start."
fi

export ULTRASTATS_HOME="/var/www/html"
export ULTRASTATS_DB_HOST="$DB_HOST"
export ULTRASTATS_DB_USER="$DB_USER"
export ULTRASTATS_DB_PASS="$DB_PASS"
export ULTRASTATS_DB_NAME="$DB_NAME"
export ULTRASTATS_DB_PORT="$DB_PORT"
export ULTRASTATS_TBPREF="$TBPREF"

# Same SQL as install.php step 5: db_template + codwwonly, ENGINE=, statement split, config rows.
# Fixes partial/empty DB and Windows CRLF issues from mysql-only init.
echo "Applying dev database schema (php seed)..."
if ! php /usr/local/share/ultrastats/seed-database.php; then
  echo "ERROR: seed-database.php failed — fix errors above, or run: docker compose -f docker/docker-compose.yml down -v  (wipes MySQL data)"
  exit 1
fi

echo "Waiting for required table ${TBPREF}weapons..."
if php /wait-schema.php 2>/dev/null; then
  echo "Schema is ready."
else
  echo "ERROR: wait-schema did not see ${TBPREF}weapons. Check MySQL and seed output."
  exit 1
fi

exec php -S 0.0.0.0:8091 -t /var/www/html
