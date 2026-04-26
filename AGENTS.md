# AGENTS.md — UltraStats

Guidance for humans and AI agents working in this repository.

## What this project is

**UltraStats** is a **PHP** application that parses **Call of Duty** dedicated server log files, stores data in **MySQL**, and exposes a **front-end** (player/round/weapon stats) plus an **admin** area (parser, configuration, users). Core version is **0.3.13** (`$content['BUILDNUMBER']` in `src/include/functions_common.php`).

**Runtime baseline (modernisation):** **PHP 7.4+**; **MySQL 5.7+ / 8+** or compatible MariaDB. **Docker** in this repo targets **PHP 8.2** for local development.

## License

- **GPL-3.0+** (see [LICENSE](LICENSE) / [COPYING](COPYING)).

## Directory map

| Path | Purpose |
|------|---------|
| `src/` | **Document root** for the app (upload/deploy this tree to the web server). |
| `src/include/` | Core PHP: `functions_common.php` (init, sessions, helpers), `functions_db.php` (DB layer, **mysqli**), parser (`functions_parser*.php`), `class_template.php` (templating). |
| `src/admin/` | Admin UI: `login.php`, `parser.php`, `upgrade.php`, `servers.php`, etc. |
| `src/templates/` | HTML templates for front-end and admin. |
| `src/lang/` | Language packs (`en/`, `de/`) — `main.php` / `admin.php` string files. |
| `src/contrib/` | **SQL:** `db_template.txt` (base schema), `db_update_v*.txt` (incremental upgrades), `config.sample.php`, helper scripts. |
| `src/gamelogs/` | Place server log files here (or mount another path) for the parser. |
| `src/doc/` | Legacy static HTML documentation (EN/DE). **Do not** link to **wiki.ultrastats.org** — it is defunct. |
| `docker/` | `Dockerfile` and `docker-compose.yml` for local dev (see below). |

## Entry points (HTTP)

- **Front:** `src/index.php`, `players.php`, `rounds.php`, `weapons.php`, `find-chat.php`, etc.
- **Install:** `src/install.php` (first-time DB + `config.php` creation when applicable).
- **Admin:** `src/admin/index.php`, `src/admin/login.php`, `src/admin/parser.php`, `src/admin/upgrade.php`.

## Configuration

- **Live config:** `src/config.php` (often gitignored); copy from `src/contrib/config.sample.php`.
- **DB:** `$CFG['DBServer']`, `$CFG['Port']`, `$CFG['DBName']`, `$CFG['TBPref']` (table prefix), `$CFG['User']`, `$CFG['Pass']`.
- In Docker, `config.php` is generated or overridden via environment variables and the `web` service entrypoint (see `docker/`).

## Conventions in code

- **`define('IN_ULTRASTATS', true);`** at the top of public scripts, then `include` `include/functions_common.php` with `$gl_root_path` set (e.g. `'./'` or `'./../'` from `admin/`).
- **`$gl_root_path`:** path prefix to `src/`.
- **Init order:** e.g. `InitUltraStats()` → config load, DB connect, language, template. Install uses `IN_ULTRASTATS_INSTALL` and `InitBasicUltraStats()` in some steps.

## Database

- **Internal schema version** is tracked in `functions_db.php` as `$content['database_internalversion']` and in table `…config` key `database_installedversion`.
- **Upgrades** run from `src/contrib/db_update_vN.txt` via `src/admin/upgrade.php`.

## How to run locally (Docker)

From the **repository root**:

```bash
docker compose -f docker/docker-compose.yml up --build
```

- App (PHP built-in server) and MySQL 8 are wired in `docker/docker-compose.yml` — web UI: **http://localhost:8091/** (host port `8091`).
- **Schema:** the web container runs `docker/seed-database.php` (same logic as `install.php` step 5: `db_template.txt` + `db_template_codwwonly.txt`, `TYPE`→`ENGINE`, then `stats_` config rows). It repairs **partial** DBs (drops `stats_*` and re-imports). MySQL’s `01-import.sh` also runs on first volume init (CRLF-safe). If you get stuck, `docker compose -f docker/docker-compose.yml down -v` resets the DB volume.
- Gamelogs: mount `src/gamelogs` or add files under that directory.

**Do not** hardcode host-specific paths in committed files. Copy sample logs from your own backup location into `src/gamelogs/` or a bind mount.

## External resources (outdated / dead)

- **wiki.ultrastats.org** — **gone**. Do not add or restore links to it in docs or templates.
- **ultrastats.org** may still be referenced in 2008-era footers; treat as historical, not a support guarantee.

## Security notes

- See [SECURITY.md](SECURITY.md) in this repo for redirect/session/SQL hardening and operational notes.
- **Never** commit real production database passwords.

## Where to look when changing things

- **DB API:** `src/include/functions_db.php` (single place to adjust connection, query helpers, **mysqli**).
- **Session / login:** `src/include/functions_users.php`, `StartPHPSession()` in `functions_common.php`.
- **Parser pipeline:** `src/admin/parser.php`, `src/admin/parser-core.php`, `src/include/functions_parser.php`.

## Modernisation backlog

- Broader plan (if present in the repo) may live in `.cursor/plans/` or your issue tracker: mysqli migration, security review, UI compatibility report, inline PHPDoc on critical includes.
