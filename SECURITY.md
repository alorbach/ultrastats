# UltraStats — security notes

This document describes hardening applied during the modernisation pass and safe operations for administrators.

## What was addressed

- **Open redirects** — `RedirectPage` and `RedirectResult` use `UltraStats_SanitizeRedirectTarget()` to reject absolute URLs, `//` tricks, and CR/LF injection in `Location` headers. The same helper is used for **`admin/result.php`** meta refresh and for blocking **`javascript:`** / **`data:`**-style targets, quotes, and control characters in relative targets. Flash **`msg`** and redirect text on that page are HTML-escaped for output.
- **Standalone error pages** — `DieWithErrorMsg` / `DieWithFriendlyErrorMsg` render a minimal **HTML5** document with charset/viewport; error detail text is passed through **`UltraStats_EscapeErrorTextForHtml()`** before insertion into the page.
- **User preference redirect** — `userchange.php` no longer follows arbitrary `HTTP_REFERER` URLs; only same-host referrers are used, then sanitized.
- **Session fixation** — on successful admin login, `session_regenerate_id(true)` is called.
- **Session cookies** — where supported (PHP 7.3+), `session_set_cookie_params` sets `httponly`, `samesite=Lax`, and `secure` when HTTPS is detected. `session.use_strict_mode` is turned on.
- **Chat search SQL** — `find-chat.php` uses **bound parameters** (`DB_QueryBound`) for the `LIKE` pattern, with `UltraStats_SqlLikeContainsPattern()` so `%` / `_` / `\\` in the search text are treated as literals inside the match.
- **Player search** — `find-players.php` uses prepared statements for PLAYERID equality and alias / PBGUID `LIKE` searches.
- **Admin users** — `src/admin/users.php` uses `DB_QueryBound` / `DB_ExecBound` for username and password values and numeric user id on selects/updates/deletes. Confirmed account deletion requires **POST** with **`ultrastats_csrf`** matching the logged-in session (see **`UltraStats_AdminCsrf*`** in `functions_common.php`; token is regenerated on login). The intermediate confirmation form posts to **`users.php`** without query-string **`verify=yes`** reliance.
- **Admin player / string deletes** — `src/admin/players.php` and `src/admin/stringeditor.php` require **POST** + **`ultrastats_csrf`** on the final confirm step (first step remains **`GET`** to the warning screen only). **`verify=yes`** is **not** used for execution on those paths.
- **Parser destructive actions (browser)** — `delete`, `deletestats`, and `resetlastlogline` require a **`parser_confirm_nonce`** issued when the confirmation screen is rendered; **`verify=yes`** alone is **no longer** sufficient on those paths. SSE (`parser-sse.php`) **`confirm_action`** URLs include the same nonce. **Cron/CLI** parser shell paths are unchanged (`parser-shell.php` uses `RUNMODE_COMMANDLINE`).
- **Admin login** — `CheckUserLogin()` uses a bound `SELECT` by username; verifies **legacy MD5** or **`password_hash()`**; on successful MD5 login, rehashes to `password_hash()` after database upgrade **v8** widens `stats_users.password`. Run **Database Upgrade** (`admin/upgrade.php`) so internal version matches the app (including v8).
- **Parser** — `parser-core.php`, `parser.php`, and `parser-shell.php` load server rows with `WHERE ID = ?`.
- **Database API** — legacy `mysql_*` calls were removed; the app uses **mysqli** only (PHP 7+ compatible). Prepared helpers require **mysqlnd** (see [docs/prepared-statements-surface.md](docs/prepared-statements-surface.md)).
- **Admin servers / players / string editor** — `admin/servers.php` uses bound parameters for high-risk server create/edit and id-scoped loads; some list or secondary paths may still use string-built `DB_Query`. `admin/players.php` and `admin/stringeditor.php` use `DB_QueryBound` / `DB_ExecBound` for list filters (including `LIKE`), edit loads, and delete chains; details and any remaining surface are in [docs/prepared-statements-surface.md](docs/prepared-statements-surface.md).
- **Admin validation messages** — key `{ERROR_MSG}` paths are escaped before template output (`players`, `users`, `stringeditor`, `servers`, `parser`, `login`, `upgrade`, `servers-ftpbuilder`) and rendered through the established alert/live-region pattern.

## What you should still do

- **Password hashing** — new and changed passwords use **`password_hash()`**. Legacy **MD5** values still work until the user logs in successfully (then the row is rehashed). Apply database upgrade to **v8** so the `password` column is wide enough for bcrypt. If rehash fails (e.g. column still `VARCHAR(32)`), run `admin/upgrade.php` first.
- **Database credentials** — do not commit `config.php` with real secrets. Use `contrib/config.sample.php` as a template; keep `config.php` out of VCS in production.
- **Display errors** — keep `display_errors=Off` in production `php.ini`.
- **SQL injection (remaining surface)** — several areas still use `DB_Query` with escaped or cast input (not bound parameters) for list/report queries, the install wizard, and some helpers. **Migrated** paths are listed in [docs/prepared-statements-surface.md](docs/prepared-statements-surface.md); that document also lists **follow-up candidates** (e.g. `install.php`, dynamic `WHERE` in list UIs, core filters). Prefer `DB_QueryBound` / `DB_ExecBound` for new code and when refactoring user-influenced SQL.
- **Admin surface** — keep the `admin/` area behind network controls or additional auth (HTTP basic, VPN, or IP allowlist) if the app is exposed to the internet.

**Maintainer hosting** — HTTPS/TLS, production `php.ini`, secrets, `admin/` exposure, debug settings, and similar are **maintainer / operator** duties. See [docs/maintainer-deployment.md](docs/maintainer-deployment.md). This repository does not track those as development tasks.

## Content-Security-Policy

UltraStats **does not** set a `Content-Security-Policy` header in PHP or Docker by default. This section documents **why** and how operators can harden **after** testing, without changing templates in this pass.

### Why CSP is not enabled out of the box

- **Inline handlers / scripts** — active templates have been moved off inline event-handler attributes (`onclick`, `onkeyup`, `onmouseover`, `onmousemove`, `onmouseout`) into delegated handlers in `src/js/common.js` (for example autosubmit selects, public menu toggles, popup/help hovers, FTP builder helpers, browser confirms, and admin back links). Classic parser autoscroll/reload snippets, the embedded admin parser EventSource UI, admin index medal controls, FTP builder popup window hints, and dynamic parser confirm/FTP panels also use shared JS plus `data-*` markers and CSS classes/tokens instead of inline script/style blocks. A strict `script-src` still needs a full UI regression pass because legacy JavaScript remains and the application does not emit CSP headers by default.
- **Legacy JavaScript** — `src/js/common.js` still contains old global helper names for compatibility, but active IE-specific branches have been removed. It may not satisfy every tight CSP/browser target without a full regression pass. See the static review in [docs/ui-compatibility-review.md](docs/ui-compatibility-review.md) (CSP and **Recommended follow-ups** there).
- **Risk of a blind strict policy** — turning on a **strict** default without validation can break menus, server pickers, admin forms, and parser UIs. Prefer **staged** rollout (below).

### Staged hardening (operators)

Short walkthrough: [docs/csp-staging.md](docs/csp-staging.md).

1. **Report-Only first** — serve **`Content-Security-Policy-Report-Only`** with the policy you intend, plus a `report-to` or `report-uri` endpoint (or use the browser’s developer tools / extension to inspect reports). Fix violations you care about, then move to an enforcing policy.
2. **Temporary relaxations (documented)** — if a local customization still needs inline script, a **short-term** option is to allow `'unsafe-inline'` in `script-src` **only** in a *deliberate* policy and **only** on routes you have tested, then tighten. Prefer **refactoring** to external scripts and non-inline handlers.
3. **After a UI pass** — consider **`nonce-`** or **`hash-`** for any remaining local/custom inline blocks, and remove `unsafe-inline` when possible.

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

### In-application CSP (not implemented)

UltraStats does **not** set `Content-Security-Policy` (or related headers) in PHP. Operators should continue to configure CSP at the **web server** or **reverse proxy** as in this section; an optional future UI pass could add headers or nonces in code.

## Reporting issues

Use your repository’s private issue tracker. Do not post live credentials in issues.
