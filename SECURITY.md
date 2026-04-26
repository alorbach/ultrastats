# UltraStats — security notes

This document describes hardening applied during the modernisation pass and safe operations for administrators.

## What was addressed

- **Open redirects** — `RedirectPage` and `RedirectResult` use `UltraStats_SanitizeRedirectTarget()` to reject absolute URLs, `//` tricks, and CR/LF injection in `Location` headers.
- **User preference redirect** — `userchange.php` no longer follows arbitrary `HTTP_REFERER` URLs; only same-host referrers are used, then sanitized.
- **Session fixation** — on successful admin login, `session_regenerate_id(true)` is called.
- **Session cookies** — where supported (PHP 7.3+), `session_set_cookie_params` sets `httponly`, `samesite=Lax`, and `secure` when HTTPS is detected. `session.use_strict_mode` is turned on.
- **Chat search SQL** — `find-chat.php` builds `LIKE` patterns with `mysqli_real_escape_string` (via `DB_EscapeString`) after escaping `%`, `_`, and `\` for `LIKE` semantics.
- **Database API** — legacy `mysql_*` calls were removed; the app uses **mysqli** only (PHP 7+ compatible).

## What you should still do

- **Password hashing** — admin passwords are still **MD5** in the `stats_users` table (original design). For production, plan a migration to `password_hash()` / `password_verify()` and a one-time re-hash or password-reset flow.
- **HTTPS** — deploy behind TLS in production; restrict admin to HTTPS if possible.
- **Database credentials** — do not commit `config.php` with real secrets. Use `contrib/config.sample.php` as a template; keep `config.php` out of VCS in production.
- **Display errors** — keep `display_errors=Off` in production `php.ini`.
- **SQL injection (general)** — many queries still use string concatenation with `DB_RemoveBadChars` / `addslashes`. For new or high-risk code, prefer **prepared statements** (`mysqli_prepare` / bound parameters).
- **Admin surface** — keep the `admin/` area behind network controls or additional auth (HTTP basic, VPN, or IP allowlist) if the app is exposed to the internet.

## Reporting issues

Use your repository’s private issue tracker. Do not post live credentials in issues.
