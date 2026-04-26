#!/bin/sh
# Runs once on first MySQL container start (empty data volume).
set -e
if [ ! -f /schema/db_template.txt ]; then
  echo "01-import: /schema/db_template.txt not mounted, skipping."
  exit 0
fi
echo "01-import: applying UltraStats base schema (MySQL 8 compatible ENGINE=)..."
# Strip CR (Windows line endings from bind mounts); TYPE= is invalid in MySQL 8 — use ENGINE=
tr -d '\r' < /schema/db_template.txt | sed 's/TYPE=MyISAM/ENGINE=MyISAM/ig' | mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"
echo "01-import: done."
