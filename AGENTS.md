# AGENTS.md — UltraStats

Guidance for humans and AI agents working in this repository.

## What this project is

**UltraStats** is a **PHP** application that parses **Call of Duty** dedicated server log files, stores data in **MySQL**, and exposes a **front-end** (player/round/weapon stats) plus an **admin** area (parser, configuration, users). Core version is **0.3.20** (`$content['BUILDNUMBER']` in `src/include/functions_common.php`).

**Repository overview for humans:** [README.md](README.md) at the root (the plain [README](README) file is a one-screen pointer to that file).

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
| `src/doc/` | Bundled **Markdown** docs (`en/*.md` — readme, install, changelog, license pointer). **Do not** link to **wiki.ultrastats.org** — it is defunct. |
| `ChangeLog` (repo root) | **Plain-text release history** (`Version …` blocks). The GitHub release workflow excerpts this file when you push tag `v*` — keep it accurate. |
| `docker/` | `Dockerfile`, `docker-compose.yml` (dev seed), and `docker-compose.install-e2e.yml` (clean install + Playwright). |
| `e2e/` | Playwright tests for the install wizard (`npm ci` / run via install-e2e compose). |
| `doc-site/` | **MkDocs** public handbook (deployed to GitHub Pages from `main`). Includes [project-history.md](doc-site/docs/project-history.md) (2000s origins, dormancy, 2026 revival with AI-assisted maintenance). |
| `.github/workflows/` | CI: [release-on-tag.yml](.github/workflows/release-on-tag.yml) (releases on `v*`), [github-pages.yml](.github/workflows/github-pages.yml) (handbook on push to `main`), [install-e2e.yml](.github/workflows/install-e2e.yml) (install wizard browser test). |

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
- **Upgrades** run from `src/contrib/db_update_vN.txt` via `src/admin/upgrade.php`. A file with **one** SQL statement is valid (the upgrader must not require more than one chunk).
- **Version 9:** `stats_aliases.AliasChecksum` is **`INT UNSIGNED`** so PHP `sprintf('%u', crc32(...))` values (0–4294967295) fit; legacy signed `INT` caused MySQL **1264** on insert for many aliases.
- **Version 10:** non-unique index **`idx_aliases_server_player_alias` (`SERVERID`, `PLAYERID`, `Alias`)** on `stats_aliases` to speed the parser’s lookup-by-natural-key path (see `EXPLAIN` on that query if tuning).
- **Version 13:** non-unique index **`idx_aliases_playerid_alias` (`PLAYERID`, `Alias`)** on `stats_aliases` for global `CreateTopAliases` (Run total stats) aggregating across all servers (see `parser_performance_explain_baseline.sql`).

**Performance / profiling (gamelog and SQL):**

- Use **`EXPLAIN`** on hot queries (e.g. `stats_aliases` by server/player/alias) after schema changes; enable MySQL **`slow_query_log`** for a representative parse and review wall time vs PHP.
- **`INSERT ... ON DUPLICATE KEY UPDATE`** for aliases would need a **UNIQUE** key on the business natural key (not only the v10 secondary index); that is a larger migration—evaluate against duplicate risk and offline testing.
- **`MYSQL_BULK_MODE`** (see `ProcessUpdateStatement` / `ProcessQueuedUpdateStatement` in `functions_parser-helpers.php`) can batch updates via the mysql CLI when enabled in config; requires a working `$content['MYSQLPATH']` and is optional on restricted hosts.

## Embedded parser (SSE)

- **Admin log stream:** [`src/admin/parser-sse.php`](src/admin/parser-sse.php) serves **`text/event-stream`** (Server-Sent Events) for the same operations as [`parser-core.php`](src/admin/parser-core.php). The template [`src/templates/admin/parser.html`](src/templates/admin/parser.html) uses **`EventSource`** to append lines without iframe reloads; `need_resume` / `runtotals_next` / `done` events handle timeout resume and post-parse totals.
- **Reverse proxies:** disable response buffering for SSE (e.g. **nginx:** `proxy_buffering off` and/or `X-Accel-Buffering: no` on the location; **Apache:** avoid mod_deflate on the stream). PHP sets `X-Accel-Buffering: no` for compatibility.
- **Limitation:** operations that emit **HTML forms** (e.g. FTP password, delete confirmation) are still designed for `parser-core.php` in a full page; use the classic parser page or CLI for those paths if the stream is unusable.
- **Cancel:** [`src/admin/parser-cancel.php`](src/admin/parser-cancel.php) sets a flag under `tmp/parser_cancel_<serverId>.flag`; `RunParserNow` cooperatively stops after the current round (or during line-count / skip-old-lines phases). The UI button targets only the `updatestats` SSE stream.

## How to run locally (Docker)

From the **repository root**:

```bash
docker compose -f docker/docker-compose.yml up --build
```

- App (PHP built-in server) and MySQL 8 are wired in `docker/docker-compose.yml` — web UI: **http://localhost:8091/** (host port `8091`).
- **Schema:** the web container runs `docker/seed-database.php` (same logic as `install.php` step 5: `db_template.txt` + `db_template_cod4only.txt`, `TYPE=MyISAM` → `ENGINE=InnoDB` or `ENGINE=MyISAM` via [`UltraStats_ApplyStorageEngineToSchemaSql`](src/include/functions_db.php); default matches the installer: **InnoDB**. Override with env **`ULTRASTATS_DB_STORAGE_ENGINE=MyISAM`** (or `InnoDB`) if needed. Then `gen_gameversion` = COD4, two sample `stats_servers` rows pointing at `gamelogs/cod4_normal.log` and `gamelogs/cod4_hq_new.log`, and a default **`stats_users` row: username `admin`, password `pass`** for local dev only — **change or remove this in any shared or production deployment**). If MySQL init (`01-import.sh`) already created tables without `gen_gameversion`, the seed **replaces** the schema when `ULTRASTATS_NUKE_PARTIAL` is enabled (default). If you get stuck, `docker compose -f docker/docker-compose.yml down -v` resets the DB volume.
- Gamelogs: bundled CoD4 samples live under `src/gamelogs/`; the bind mount `../src:/var/www/html` serves them to the container. **WaW** (`cod5_*`) is not used for the default Docker seed.

### Install wizard E2E (clean DB + Playwright)

The default compose stack **pre-seeds** the database and writes `config.php`, so it does not exercise [`src/install.php`](src/install.php). For a **full browser run** of steps 1–7 on an **empty** MySQL database (including step 5 SQL), use [`docker/docker-compose.install-e2e.yml`](docker/docker-compose.install-e2e.yml):

```bash
docker compose -f docker/docker-compose.install-e2e.yml up --build --abort-on-container-exit --exit-code-from playwright
```

- **Host URL** during the run: **http://localhost:8092/** (port **8092** avoids clashing with dev **8091**).
- **Reset MySQL** for a fresh run: `docker compose -f docker/docker-compose.install-e2e.yml down -v`.
- **Local `config.php`:** the install-e2e compose sets **`ULTRASTATS_INSTALL_E2E_STASH_CONFIG=1`**, so a non-empty `src/config.php` is **moved to** `src/config.php.ultrastats-e2e-stash` before the server starts (then the installer can create a fresh `config.php`). Restore your old file with `mv -f src/config.php.ultrastats-e2e-stash src/config.php` when you want it back. To force the old “fail if config exists” behavior, unset that env on the `web` service.
- Tests live under [`e2e/`](e2e/) ([`e2e/tests/install-wizard.spec.ts`](e2e/tests/install-wizard.spec.ts)). To run Playwright against an already-up stack from the host: `cd e2e && npm ci && set PLAYWRIGHT_BASE_URL=http://127.0.0.1:8092&& npx playwright test` (Unix: `export PLAYWRIGHT_BASE_URL=...`).
- CI: [.github/workflows/install-e2e.yml](.github/workflows/install-e2e.yml) (on **push to `main`**, **pull requests**, and **manual** `workflow_dispatch`). Each run uploads artifact **`install-e2e-reports`**: open **`install-e2e-report/index.html`** for a step-by-step screenshot gallery, or **`playwright-report/index.html`** for the full Playwright HTML report (includes the same shots as attachments). Artifacts are kept **14 days**.
- **Local reports** after `docker compose … install-e2e`: under [`e2e/install-e2e-report/`](e2e/install-e2e-report/) and [`e2e/playwright-report/`](e2e/playwright-report/) (both gitignored).
- **Installer DB charset:** during `IN_ULTRASTATS_INSTALL`, [`DB_Connect()`](src/include/functions_db.php) uses **`latin1`** for the mysqli session so `contrib/*.txt` schema (legacy 8-bit strings) matches the Docker seed path; normal app traffic still uses **utf8mb4**.

**Do not** hardcode host-specific paths in committed files. Copy sample logs from your own backup location into `src/gamelogs/` or a bind mount.

## External resources (outdated / dead)

- **wiki.ultrastats.org** — **gone**. Do not add or restore links to it in docs or templates.
- The public **handbook** is on GitHub Pages: [https://alorbach.github.io/ultrastats/](https://alorbach.github.io/ultrastats/) (replaces the old project site; templates and update checks point there). **`doc-site/docs/version.txt`** (deployed as `/version.txt`) feeds the admin “new version” check (`UPDATEURL` in `functions_common.php`); bump its **first line** to the new `$content['BUILDNUMBER']` when you ship a release so logged-in admins see the prompt.

## Security notes

- See [SECURITY.md](SECURITY.md) in this repo for redirect/session/SQL hardening, operational notes, and **[Content-Security-Policy (documentation only; not set by the app by default)](SECURITY.md#content-security-policy)**.
- **Never** commit real production database passwords.

## Where to look when changing things

- **DB API:** `src/include/functions_db.php` (single place to adjust connection, query helpers, **mysqli**).
- **Session / login:** `src/include/functions_users.php`, `StartPHPSession()` in `functions_common.php`.
- **Parser pipeline:** `src/admin/parser.php`, `src/admin/parser-core.php`, `src/admin/parser-sse.php`, `src/admin/parser-core-operations.php`, `src/include/functions_parser.php`.

**Alias / top-alias data after the `DB_GetAllRows` + `isset()` fix:** Older parses may have **missing** rows in `stats_aliases`, `stats_players_static`, or derived top-alias data because empty result sets were mis-handled. After upgrading, use **reset last log line** and **re-parse**, or **delete server stats** and parse again, or run **Run total update** / **Create top aliases** once the underlying tables are populated.

## Changelog and documentation maintenance

- **Keep the changelog dual-format in sync:** update the root [ChangeLog](ChangeLog) (plain text) and [src/doc/en/changelog.md](src/doc/en/changelog.md) (Markdown) together for the same version or new bullets. Match wording and substance; in `changelog.md`, use correct relative links from `src/doc/en/` (often `../../../` to the repo root or `docs/`).
- **When to update:** user-visible fixes/features (parser, admin, install/upgrade, Docker dev defaults), bumps to **`database_internalversion`** / new `db_update_v*.txt`, security-relevant behavior, or anything operators need to know. Prefer short, accurate bullets over pasting raw commit subjects.
- **Releases:** pushing tag `v*` triggers [.github/workflows/release-on-tag.yml](.github/workflows/release-on-tag.yml), which builds release notes from **ChangeLog** (via [.github/scripts/build_release_body.py](.github/scripts/build_release_body.py)). A stale ChangeLog means a misleading GitHub Release.
- **Other bundled docs:** if behavior changes, update the relevant Markdown under `src/doc/en/` (e.g. install/upgrade) and any pointers in [README.md](README.md), [SECURITY.md](SECURITY.md), or [docs/](docs/) so operators and future agents see one consistent story.

## Modernisation backlog

- Broader plan may live in your issue tracker (or a local `plans` folder if you use one): mysqli migration, security review, UI compatibility report, inline PHPDoc on critical includes.

## Agent skills (`.agent/`)

Playbooks in **[`.agent/README.md`](.agent/README.md)** and **[`.agent/skills/`](.agent/skills/summarize-handoff.md)** — **SUMMARIZE** / squashed commits, local Docker, security hygiene, repository map. **SUMMARIZE** workflow: [`.agent/skills/summarize-handoff.md`](.agent/skills/summarize-handoff.md) (run `git status -sb` and `git diff --stat` from the repo root first).

- [docs/summarize-handoff.md](docs/summarize-handoff.md) is a short redirect to `.agent/`.
- GitHub **Copilot** also reads [.github/copilot-instructions.md](.github/copilot-instructions.md) (points at AGENTS and summarize skill).
