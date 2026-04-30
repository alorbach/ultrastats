# Admin destructive actions — inventory (Phase 6.1a)

Cross-reference: [SECURITY.md](../SECURITY.md), [frontend-admin-modernization-progress.md](frontend-admin-modernization-progress.md).

| Action | Primary entry | First step | Confirmed execution | CSRF / token |
|--------|----------------|------------|---------------------|---------------|
| Delete server (+ stats) | `parser.php` / `parser-core.php` / `parser-sse.php` (`op=delete`) | HTML / SSE warning + nonce link | Same URL with `parser_confirm_nonce` (single-use, session-backed) | **Nonce** (`UltraStats_ParserConfirmNonce*` in `functions_parser-helpers.php`) — EventSource-compatible GET |
| Delete server stats only | same (`op=deletestats`) | Warning + nonce | Nonce consumes on commit | Same nonce pattern |
| Reset last log line | same (`op=resetlastlogline`) | **New:** warning + nonce (was one-click destructive on web) | Nonce consumes on commit | Same nonce pattern |
| User delete | `admin/users.php?op=delete&id=` | Inline admin template `[admin_securecheck.html](../src/templates/admin/admin_securecheck.html)` | **`POST`** `users.php` with `op`, `id`, `admin_confirm_delete=1`, `ultrastats_csrf` | **POST + CSRF** (`UltraStats_AdminCsrf*` in `functions_common.php`) → **PRG** via `result.php` |
| Player delete chain | `admin/players.php?op=delete&id=` … | Intermediate page + **POST** confirm | **`POST`** `players.php` with `op=delete`, `id`, `admin_confirm_player_delete=1`, `playerfilter`, `start`, `ultrastats_csrf` | **POST + CSRF** (`UltraStats_AdminCsrf*` in `functions_common.php`) |
| String delete | `admin/stringeditor.php?op=delete&id=&lang=` | Intermediate page + **POST** confirm | **`POST`** `stringeditor.php` with `op=delete`, `id`, `lang`, `admin_confirm_string_delete=1`, `strfilter`, `start`, `ultrastats_csrf` | **POST + CSRF** → **PRG** via `result.php` |

**Pilot shipped in this roadmap slice**

1. **User delete — POST + session CSRF + PRG** (`users.php`).
2. **Parser destructive trio (delete server / delete stats / reset last line) — confirmation + session nonce** replacing plain `verify=yes` so cross-site **`GET`** cannot replay a bookmarked destructive URL without a freshly issued nonce (SSE **`confirm_action`** URLs include the same nonce).
3. **Player delete — POST + session CSRF** on the confirm step (`players.php`); first step remains **`GET`** `op=delete` to the warning screen only.
