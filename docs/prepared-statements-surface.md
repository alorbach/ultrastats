# SQL surface inventory (user-influenced / high-risk)

Static audit of where request data or untrusted text reaches SQL, used to prioritize **prepared statement** work.

## Migrated to `DB_QueryBound` / `DB_ExecBound` (this pass)

| Area | File | Notes |
|------|------|--------|
| Chat search (LIKE) | `src/find-chat.php` | `?` for pattern; `UltraStats_SqlLikeContainsPattern()` |
| Player search | `src/find-players.php` | Types 1–3: `i` for PLAYERID, `s` for alias/PBGUID LIKE |
| Admin users (CRUD) | `src/admin/users.php` | `username`/`password` inserts/updates; `ID` on select/delete; duplicate check |
| Parser server load | `src/admin/parser-core.php`, `src/admin/parser.php` | `SELECT * … WHERE ID = ?` (server id) |
| CLI parser | `src/admin/parser-shell.php` | `WHERE ID = ?` for argv server id |

## Still using `DB_Query` / string SQL (not exhaustive)

| Pattern | Examples |
|--------|----------|
| Admin forms | `src/admin/servers.php`, `stringeditor.php`, `players.php` — many `INSERT`/`UPDATE` with `DB_RemoveBadChars` |
| Read-only lists | Rounds, weapons, list pages with **validated** `intval()` for paging — lower risk, still string-built |
| Core helpers | `functions_common.php` / `functions_frontendhelpers.php` — server filters, time filters, stats |

## API notes

- Helpers live in `src/include/functions_db.php`: `DB_QueryBound()`, `DB_ExecBound()`, `UltraStats_SqlLikeContainsPattern()`.
- **mysqlnd** is required for `DB_QueryBound()` (`mysqli_stmt_get_result()`). The Docker PHP 8.2 image includes mysqlnd.
- `LIKE` “contains” search must escape `%`, `_`, `\` in the user fragment before binding; use `UltraStats_SqlLikeContainsPattern()`.

## Follow-up candidates

- `admin/servers.php` server add/edit (many string fields)
- `admin/players.php` GUID / ban fields
- `admin/stringeditor.php` language string keys
- `install.php` (installer session strings — lower exposure if not internet-facing)
