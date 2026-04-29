# UltraStats

UltraStats is a log parser and web front-end for **Call of Duty** game server logs. It reads match logs, stores statistics in MySQL, and serves rankings, player pages, round history, and an admin area (parser, config, users).

**Version:** see **`$content['BUILDNUMBER']`** in [`src/include/functions_common.php`](src/include/functions_common.php) (also the first line of [`doc-site/docs/version.txt`](doc-site/docs/version.txt) for the admin update check).

**License:** See [LICENSE](LICENSE) and [COPYING](COPYING) (GPL-3.0+).

**Author:** [Andre Lorbach](https://github.com/alorbach) — [github.com/alorbach/ultrastats](https://github.com/alorbach/ultrastats); see original headers in `src/`.

## History

UltraStats dates to the **mid-2000s** community development around **Call of Duty** dedicated servers; public 0.3.x work in [src/doc/en/changelog.md](src/doc/en/changelog.md) runs through **2008** (last classic line: **0.3.13**, 2008-11-30). For many years afterward the **original site and wiki were gone** and there were no official releases in the open record—until **2026**, when the codebase was **modernized** (current PHP/MySQL, security, Docker) with substantial help from **AI-assisted coding**, aimed at the **remaining “old school”** server operators who still want a classic stats stack. A readable timeline is in the handbook: [**Project history**](https://alorbach.github.io/ultrastats/project-history/) ([source](doc-site/docs/project-history.md)).

## Supported games (original scope)

- Call of Duty, United Offense, CoD 2, CoD 4: Modern Warfare, CoD: World at War

## Requirements

- **PHP** 7.4 or later (7.4+ is the supported baseline; 8.2+ used for local Docker; `mysqli` extension required).
- **MySQL** 5.7+ or **MariaDB 10.x+** (MySQL 8.x supported; legacy `TYPE=MyISAM` in old SQL is normalized for imports where needed).
- A web server with `src/` as the document root, or the PHP built-in server (see [AGENTS.md](AGENTS.md) and Docker).

## Installation

- Install guide: [src/doc/en/install.md](src/doc/en/install.md) (legacy root `INSTALL` is optional plain text for old habits only).
- **First-time setup:** open `src/install.php` in a browser (with `config.php` empty or missing as required by the installer) and follow the wizard.
- **Configuration:** copy `src/contrib/config.sample.php` to `src/config.php` and set database credentials, or let the installer create `config.php`. **Do not commit real production passwords**; `src/config.php` is listed in `.gitignore` for local development.

## Project layout

| Path | Role |
|------|------|
| `src/` | Web root: PHP entry points, `include/`, `admin/`, `templates/`, `lang/`, `gamelogs/` |
| `src/include/` | Core libraries (`functions_db.php`, `functions_common.php`, parser helpers, etc.) |
| `src/contrib/` | SQL templates (`db_template.txt`), upgrades (`db_update_v*.txt`), sample `config.sample.php` |

## Development

- **CI:** [`.github/workflows/php-ci.yml`](.github/workflows/php-ci.yml) runs **`php -l`** on all `src/**/*.php` and **PHPUnit** (DB helper tests + bundled gamelog fixture). Local: `composer install` then `vendor/bin/phpunit` (see [AGENTS.md](AGENTS.md) — PHP 8.1+ for dev deps).
- **Releases:** Push a SemVer tag `vX.Y.Z` (e.g. `v0.3.15`). [GitHub Actions](.github/workflows/release-on-tag.yml) builds a source archive `ultrastats-X.Y.Z.tar.gz` (`git archive` with top folder `ultrastats-X.Y.Z/`) and creates a **GitHub Release** whose notes combine the matching block from [src/doc/en/changelog.md](src/doc/en/changelog.md) (mirrored to root `ChangeLog` for tooling) with GitHub’s auto-generated compare text. There is no separate packaging script in the repository.
- **AGENTS and Docker:** [AGENTS.md](AGENTS.md) describes structure, conventions, and how to run the stack with Docker (web on **port 8091** by default: `http://localhost:8091/`).
- **Agent skills (assistants & handoff):** [`.agent/README.md`](.agent/README.md) and [`.agent/skills/`](.agent/skills/summarize-handoff.md) — playbooks in plain Markdown for Copilot, Codex, and similar.
- **Security:** [SECURITY.md](SECURITY.md) — hardening, admin hygiene, and [Content-Security-Policy (why not enabled by default; staged rollout)](SECURITY.md#content-security-policy).
- **UI (legacy) compatibility:** [docs/ui-compatibility-review.md](docs/ui-compatibility-review.md) — static review only; no UI changes in that pass.
- Report issues through your project’s issue tracker (historical public forums may no longer exist).

## Documentation website

- **Handbook (GitHub Pages):** [https://alorbach.github.io/ultrastats/](https://alorbach.github.io/ultrastats/) — install, upgrade, Docker, admin/parser, theming, historical snapshot links, and a generated copy of the bundled **install** and **changelog** from `src/doc/en/`. The site is built with **MkDocs (Material)** from [`doc-site/`](doc-site/); on each push to **`main`**, [.github/workflows/github-pages.yml](.github/workflows/github-pages.yml) runs `doc-site/prepare_docs.py` (rewrites in-tree links) and deploys. **Local preview:** `python doc-site/prepare_docs.py` then `python -m mkdocs serve -f doc-site/mkdocs.yml` from the repository root. **First-time GitHub setup:** enable **Settings → Pages → Build and deployment → Source: GitHub Actions** for this repository.

## Changelog

- Packaged and repository history: maintained as [src/doc/en/changelog.md](src/doc/en/changelog.md); the root `ChangeLog` file is the same text in plain form for release scripts.

## Historical documentation

Bundled reference docs in **`src/doc/en/`** are **Markdown** ([readme](src/doc/en/readme.md), [install](src/doc/en/install.md), [changelog](src/doc/en/changelog.md), [copyright](src/doc/en/copyright.md)); see [src/doc/README.md](src/doc/README.md). Prefer **this file** and [AGENTS.md](AGENTS.md) for current setup; the old UltraStats wiki is **not** available anymore and must not be linked as if it were. The [documentation website](#documentation-website) includes **read-only** Wayback / mirror links for context.

## Credits

- Core project author and maintainer: [Andre Lorbach](https://github.com/alorbach).
- Release testing support: [David Sanetti](https://github.com/davemx85).

## Sample gamelogs

Example logs ship under `src/gamelogs/`. You can add more logs locally and point the parser at that directory (or bind-mount a host folder in Docker).

## Plain-text `README` in the root

A minimal [README](README) file (no extension) is kept for tools and archives that expect that filename; it only points here and to INSTALL / COPYING. **All maintained content is in this `README.md`.**
