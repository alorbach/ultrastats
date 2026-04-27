# Upgrading UltraStats

## Typical upgrade (minor or maintenance releases)

1. **Download** the version you need from [GitHub Releases](https://github.com/alorbach/ultrastats/releases) (source archive or tag checkout).
2. On the web server, replace the **contents of your UltraStats `src/` area** with the new **`src/`** from the release—do not remove your existing `config.php` unless a release note tells you to.
3. Log in to the **Admin Center** in a browser.
4. If the application prompts for a **database upgrade**, run it and confirm success. This applies statements from [`src/contrib/db_update_v*.txt`](https://github.com/alorbach/ultrastats/tree/main/src/contrib) as needed; the internal schema version is tracked in the `config` table and in code (`functions_db.php`).

That covers most upgrades, as long as you keep backups and test after deploy.

## What runs the database upgrade

- **Admin → Upgrade** (or the upgrade flow the UI exposes): [`src/admin/upgrade.php`](https://github.com/alorbach/ultrastats/blob/main/src/admin/upgrade.php) runs the appropriate `db_update_*.sql` for your current version. Each file may contain a single or split batch of SQL, depending on version.

## Release archives

- Pushing a SemVer tag `v*.*.*` produces a [release workflow](https://github.com/alorbach/ultrastats/blob/main/.github/workflows/release-on-tag.yml) tarball `ultrastats-X.Y.Z.tar.gz` with a top folder `ultrastats-X.Y.Z/`. Use the **`src/`** inside that tree as the upload source to your web root.

## Old documentation (2008–2009)

Community sites used to say: “copy everything under `src/` into your site root, then ACP → database update.” The idea is the same; download URLs pointed at third-party mirrors and are no longer valid—use **GitHub Releases** instead. See [historical-reference.md](historical-reference.md) for snapshot links.
