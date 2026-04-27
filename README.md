# UltraStats

UltraStats is a log parser and web front-end for **Call of Duty** game server logs. It reads match logs, stores statistics in MySQL, and serves rankings, player pages, round history, and an admin area (parser, config, users).

**Version:** 0.3.14 (see `src/include/functions_common.php`).

**License:** See [LICENSE](LICENSE) and [COPYING](COPYING) (GPL-3.0+).

**Author:** Andre Lorbach (deltaray) — see original headers in `src/`.

## Supported games (original scope)

- Call of Duty, United Offense, CoD 2, CoD 4: Modern Warfare, CoD: World at War

## Requirements

- **PHP** 7.4 or later (7.4+ is the supported baseline; 8.2+ used for local Docker; `mysqli` extension required).
- **MySQL** 5.7+ or **MariaDB 10.x+** (MySQL 8.x supported; legacy `TYPE=MyISAM` in old SQL is normalized for imports where needed).
- A web server with `src/` as the document root, or the PHP built-in server (see [AGENTS.md](AGENTS.md) and Docker).

## Installation

- Legacy step-by-step text: [INSTALL](INSTALL) (and bundled Markdown under [src/doc/en/install.md](src/doc/en/install.md)).
- **First-time setup:** open `src/install.php` in a browser (with `config.php` empty or missing as required by the installer) and follow the wizard.
- **Configuration:** copy `src/contrib/config.sample.php` to `src/config.php` and set database credentials, or let the installer create `config.php`. **Do not commit real production passwords**; `src/config.php` is listed in `.gitignore` for local development.

## Project layout

| Path | Role |
|------|------|
| `src/` | Web root: PHP entry points, `include/`, `admin/`, `templates/`, `lang/`, `gamelogs/` |
| `src/include/` | Core libraries (`functions_db.php`, `functions_common.php`, parser helpers, etc.) |
| `src/contrib/` | SQL templates (`db_template.txt`), upgrades (`db_update_v*.txt`), sample `config.sample.php` |

## Development

- **AGENTS and Docker:** [AGENTS.md](AGENTS.md) describes structure, conventions, and how to run the stack with Docker (web on **port 8091** by default: `http://localhost:8091/`).
- **Agent skills (assistants & handoff):** [`.agent/README.md`](.agent/README.md) and [`.agent/skills/`](.agent/skills/summarize-handoff.md) — playbooks in plain Markdown for Copilot, Codex, and similar.
- **Security:** [SECURITY.md](SECURITY.md) — hardening, admin hygiene, and [Content-Security-Policy (why not enabled by default; staged rollout)](SECURITY.md#content-security-policy).
- **UI (legacy) compatibility:** [docs/ui-compatibility-review.md](docs/ui-compatibility-review.md) — static review only; no UI changes in that pass.
- Report issues through your project’s issue tracker (historical public forums may no longer exist).

## Changelog

- Packaged and repository history: [ChangeLog](ChangeLog) in the repository root (also mirrored as Markdown in [src/doc/en/changelog.md](src/doc/en/changelog.md)).

## Historical documentation

Bundled reference docs in **`src/doc/en/`** are **Markdown** ([readme](src/doc/en/readme.md), [install](src/doc/en/install.md), [changelog](src/doc/en/changelog.md), [copyright](src/doc/en/copyright.md)); see [src/doc/README.md](src/doc/README.md). Prefer **this file** and [AGENTS.md](AGENTS.md) for current setup; the old UltraStats wiki is **not** available anymore and must not be linked as if it were.

## Sample gamelogs

Example logs ship under `src/gamelogs/`. You can add more logs locally and point the parser at that directory (or bind-mount a host folder in Docker).

## Plain-text `README` in the root

A minimal [README](README) file (no extension) is kept for tools and archives that expect that filename; it only points here and to INSTALL / COPYING. **All maintained content is in this `README.md`.**
