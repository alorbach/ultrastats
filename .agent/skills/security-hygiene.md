# Security hygiene — agent skill

Operational checklist; threat model in [SECURITY.md](../../SECURITY.md).

## Never commit

- **Production** database passwords or live `src/config.php` with secrets. Template: `src/contrib/config.sample.php`. Local `src/config.php` is gitignored.
- **Session / auth** details in issue posts or public chats.

## Admin surface

- Keep `src/admin/` behind network controls or extra auth (VPN, IP allow, HTTP basic) on internet-facing hosts.
- Admin passwords are still **legacy MD5** in DB — plan a migration (see SECURITY.md).

## When changing code

- Prefer **prepared** queries (`DB_QueryBound` / `DB_ExecBound` in `functions_db.php`) for user-influenced SQL. Remaining string-built queries are listed in [docs/prepared-statements-surface.md](../../docs/prepared-statements-surface.md) (if that file is present in your branch).

## Redirects and sessions

Hardening is documented in SECURITY.md (sanitized redirects, session cookies, chat LIKE escaping, etc.).
