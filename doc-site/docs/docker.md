# Docker (local development)

The repository includes a small **Docker Compose** stack for local development. It is **not** a production reference architecture; adjust images, credentials, and networking for your environment.

## Start the stack

From the **repository root**:

```bash
docker compose -f docker/docker-compose.yml up --build
```

## URLs and ports

- Web UI (PHP built-in server, inside the `web` service): by default **http://localhost:8091/** (host port **8091**; see `docker/docker-compose.yml` if it was changed).

## What the dev stack does (summary)

- Mounts the repo’s **`src/`** into the container document root.
- Brings up **MySQL 8** and runs the SQL and/or [seed script](https://github.com/alorbach/ultrastats/blob/main/docker/seed-database.php) so the schema matches a fresh install path (CoD4-oriented samples, `InnoDB` by default).
- Seeded **admin** user for local use only: username **`admin`**, password **`pass`** (change or remove in any non-local deployment).

## Gamelogs

Sample logs live under **`src/gamelogs/`**. The seed may register servers pointing at those files; you can add more logs locally and point the parser at them.

## Environment variables (examples)

- Storage engine: **`ULTRASTATS_DB_STORAGE_ENGINE`** — `InnoDB` (default) or `MyISAM` if you need to match a legacy host.
- Partial re-seed: see comments in the Docker files and [AGENTS.md](https://github.com/alorbach/ultrastats/blob/main/AGENTS.md) (`ULTRASTATS_NUKE_PARTIAL`, `docker compose down -v` to reset volumes).

## Full detail

- [AGENTS.md — “How to run locally (Docker)”](https://github.com/alorbach/ultrastats/blob/main/AGENTS.md#how-to-run-locally-docker) in the repository.
