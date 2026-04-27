# SQL surface inventory (user-influenced / high-risk)

Static audit of where request data or untrusted text reaches SQL, used to prioritize **prepared statement** work.

## Migrated to `DB_QueryBound` / `DB_ExecBound`

| Area | File | Notes |
|------|------|--------|
| Chat search (LIKE) | `src/find-chat.php` | `?` for pattern; `UltraStats_SqlLikeContainsPattern()` |
| Player search | `src/find-players.php` | Types 1–3: `i` for PLAYERID, `s` for alias/PBGUID LIKE |
| Admin users (CRUD) | `src/admin/users.php` | `username`/`password` inserts/updates; `ID` on select/delete; duplicate check; modern `password_hash` for new/updated passwords |
| Parser server load | `src/admin/parser-core.php`, `src/admin/parser.php` | `SELECT * … WHERE ID = ?` (server id) |
| CLI parser | `src/admin/parser-shell.php` | `WHERE ID = ?` for argv server id |
| Admin servers | `src/admin/servers.php` | Server add/edit/duplicate check; `ID` for edit/dbstats; list unchanged |
| Admin players (partial) | `src/admin/players.php` | Quick clan/ban toggles; post edit `PBGUID` / ban / clan fields |
| Admin string editor (partial) | `src/admin/stringeditor.php` | Add/edit `STRINGID` / `LANG` / `TEXT` |
| Config write | `src/include/functions_db.php` `WriteConfigValue()` | Values escaped; empty-row `INSERT` vs `UPDATE` |
| Admin login | `src/include/functions_users.php` | `CheckUserLogin` `SELECT` by `username` only; verify + optional rehash |

## Still using `DB_Query` / string SQL (not exhaustive)

| Pattern | Examples |
|--------|----------|
| Large list/report queries | `players.php` default list, `rounds`, `index` — some filters; often `intval` for limits |
| Install wizard | `src/install.php` — lower exposure if not internet-facing |
| Core helpers | `functions_common.php` / `functions_frontendhelpers.php` — server filters, time filters, stats |

## API notes

- Helpers live in `src/include/functions_db.php`: `DB_QueryBound()`, `DB_ExecBound()`, `UltraStats_SqlLikeContainsPattern()`.
- **mysqlnd** is required for `DB_QueryBound()` (`mysqli_stmt_get_result()`). The Docker PHP 8.2 image includes mysqlnd.
- `LIKE` “contains” search must escape `%`, `_`, `\` in the user fragment before binding; use `UltraStats_SqlLikeContainsPattern()`.

## Follow-up candidates

- `src/install.php` — bind session-driven SQL when refactored
- Remaining `players.php` / `stringeditor.php` list queries where dynamic `WHERE` is built
