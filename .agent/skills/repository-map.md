# Repository map — agent skill

Short orientation; the **full** directory table is in [AGENTS.md](../../AGENTS.md).

| You need | Path |
|----------|------|
| Web root to deploy | `src/` (PHP entry points live here) |
| Core includes, DB, init | `src/include/` — especially `functions_common.php`, `functions_db.php` |
| Admin UI | `src/admin/` — `login.php`, `parser.php`, `index.php`, … |
| SQL templates & upgrades | `src/contrib/` — `db_template.txt`, `db_update_v*.txt` |
| Language strings | `src/lang/{en,de}/` |
| Docker dev | `docker/` — `docker-compose.yml`, `Dockerfile`, `entrypoint.sh` |
| Gamelog samples / parser input | `src/gamelogs/` |

**Init pattern:** public scripts set `define('IN_ULTRASTATS', true);`, set `$gl_root_path`, then `include` `functions_common.php` (see AGENTS for details).

**Version / schema:** internal DB version in code: `src/include/functions_db.php` (`$content['database_internalversion']`) and `stats_…config` in the database.
