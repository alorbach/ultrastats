# Local development (Docker) — agent skill

Minimal commands; full detail in [AGENTS.md](../../AGENTS.md).

## One-liner (repo root)

```bash
docker compose -f docker/docker-compose.yml up --build
```

## Defaults

- Web UI: **http://localhost:8091/** (host port from `docker/docker-compose.yml`).
- App document root in the container: `src/` → `/var/www/html` (per Docker setup in this repo).
- MySQL: service name **`db`**, not `localhost`, from **inside** the web container; `config.php` is written by the entrypoint for that hostname.

## Schema / empty DB

If the app errors on missing tables, see **AGENTS.md** → “How to run locally (Docker)”: `seed-database.php`, `01-import.sh`, and when to `docker compose … down -v` to reset the volume.

## Gamelogs

Add logs under `src/gamelogs/` or bind-mount; do not hardcode host-specific paths in committed files.
