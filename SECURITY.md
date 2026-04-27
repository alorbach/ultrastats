# UltraStats — security notes

This document describes hardening applied during the modernisation pass and safe operations for administrators.

## What was addressed

- **Open redirects** — `RedirectPage` and `RedirectResult` use `UltraStats_SanitizeRedirectTarget()` to reject absolute URLs, `//` tricks, and CR/LF injection in `Location` headers.
- **User preference redirect** — `userchange.php` no longer follows arbitrary `HTTP_REFERER` URLs; only same-host referrers are used, then sanitized.
- **Session fixation** — on successful admin login, `session_regenerate_id(true)` is called.
- **Session cookies** — where supported (PHP 7.3+), `session_set_cookie_params` sets `httponly`, `samesite=Lax`, and `secure` when HTTPS is detected. `session.use_strict_mode` is turned on.
- **Chat search SQL** — `find-chat.php` uses **bound parameters** (`DB_QueryBound`) for the `LIKE` pattern, with `UltraStats_SqlLikeContainsPattern()` so `%` / `_` / `\\` in the search text are treated as literals inside the match.
- **Player search** — `find-players.php` uses prepared statements for PLAYERID equality and alias / PBGUID `LIKE` searches.
- **Admin users** — `src/admin/users.php` uses `DB_QueryBound` / `DB_ExecBound` for username and password values and numeric user id on selects/updates/deletes.
- **Parser** — `parser-core.php`, `parser.php`, and `parser-shell.php` load server rows with `WHERE ID = ?`.
- **Database API** — legacy `mysql_*` calls were removed; the app uses **mysqli** only (PHP 7+ compatible). Prepared helpers require **mysqlnd** (see [docs/prepared-statements-surface.md](docs/prepared-statements-surface.md)).

## What you should still do

- **Password hashing** — admin passwords are still **MD5** in the `stats_users` table (original design). For production, plan a migration to `password_hash()` / `password_verify()` and a one-time re-hash or password-reset flow.
- **HTTPS** — deploy behind TLS in production; restrict admin to HTTPS if possible.
- **Database credentials** — do not commit `config.php` with real secrets. Use `contrib/config.sample.php` as a template; keep `config.php` out of VCS in production.
- **Display errors** — keep `display_errors=Off` in production `php.ini`.
- **SQL injection (general)** — other pages (e.g. large parts of `admin/servers.php`, `players.php`, `stringeditor.php`, install wizard) still build SQL with `DB_RemoveBadChars` / `addslashes`. Prefer `DB_QueryBound` / `DB_ExecBound` in `functions_db.php` when adding or refactoring user-influenced queries; see [docs/prepared-statements-surface.md](docs/prepared-statements-surface.md) for a migration checklist.
- **Admin surface** — keep the `admin/` area behind network controls or additional auth (HTTP basic, VPN, or IP allowlist) if the app is exposed to the internet.

## Content-Security-Policy

UltraStats **does not** set a `Content-Security-Policy` header in PHP or Docker by default. This section documents **why** and how operators can harden **after** testing, without changing templates in this pass.

### Why CSP is not enabled out of the box

- **Inline handlers** — templates use legacy patterns such as `OnChange="document.serveridform.submit();"` and similar attributes. A strict `script-src` (without `'unsafe-inline'`) can block or alter behavior in ways that are hard to predict without a full UI regression pass.
- **Older JavaScript** — **MooTools**-era code (`src/js/mootools.js`, `src/js/common.js`) and **inline scripts** in pages may not satisfy a tight CSP. Some patterns in old libraries can resemble or use dynamic code paths; see the static review in [docs/ui-compatibility-review.md](docs/ui-compatibility-review.md) (CSP, MooTools, and **Recommended follow-ups** there).
- **Risk of a blind strict policy** — turning on a **strict** default without validation can break menus, server pickers, admin forms, and parser UIs. Prefer **staged** rollout (below).

### Staged hardening (operators)

1. **Report-Only first** — serve **`Content-Security-Policy-Report-Only`** with the policy you intend, plus a `report-to` or `report-uri` endpoint (or use the browser’s developer tools / extension to inspect reports). Fix violations you care about, then move to an enforcing policy.
2. **Temporary relaxations (documented)** — if you must allow legacy inline script until a UI refresh, a **short-term** option is to allow `'unsafe-inline'` in `script-src` **only** in a *deliberate* policy and **only** on routes you have tested, then tighten. Prefer **refactoring** to external scripts and non-inline handlers in a future UI pass (see the UI review).
3. **After a UI pass** — consider **`nonce-`** or **`hash-`** for any remaining small inline blocks, and remove `unsafe-inline` when possible.

**Non-goals for this doc:** the application code in this repository does not emit these headers; configure them in **Nginx**, **Apache**, a **reverse proxy**, or PHP if you add it locally.

#### Example (comment-only — not active in repo)

Nginx (inside a `server { … }` block, adjust to your site):

```nginx
# content-security-policy (example — test before enabling)
# add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; report-uri /csp-report" always;
# add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:" always;
```

Apache (`VirtualHost` or relevant scope; enable `mod_headers`):

```apache
# Header set Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
# Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;"
```

These examples are **illustrative**; directives must match your real asset URLs (themes, CDNs) and be validated for both the **front** and **admin** areas. Start with **Report-Only** and refine.

## Reporting issues

Use your repository’s private issue tracker. Do not post live credentials in issues.
