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
| Admin players (partial) | `src/admin/players.php` | Quick clan/ban toggles; post edit `PBGUID` / ban / clan fields; list filter `Alias` `LIKE` via `UltraStats_SqlLikeContainsPattern` + bound `?`; edit `SELECT` by `GUID`; delete chains use `DB_ExecBound` |
| Admin string editor (partial) | `src/admin/stringeditor.php` | Add/edit/update `STRINGID` / `LANG` / `TEXT`; list filter `STRINGID` `LIKE` bound; edit `SELECT` / `DELETE` bound |
| Config write | `src/include/functions_db.php` `WriteConfigValue()` | Values escaped; empty-row `INSERT` vs `UPDATE` |
| Admin login | `src/include/functions_users.php` | `CheckUserLogin` `SELECT` by `username` only; verify + optional rehash |

## Still using `DB_Query` / string SQL (not exhaustive)

| Pattern | Examples |
|--------|----------|
| Large list/report queries | Other front/admin list UIs not yet migrated (e.g. some `rounds`, `index`) — often `intval` for limits |
| Install wizard | `src/install.php` step 5 — DDL batch via `DB_Query` (install-only); config `INSERT` values cast to int for `gen_gameversion` / `database_installedversion` |
| Core helpers | `functions_frontendhelpers.php` — `GetAndSetCurrentServer()` loads server by `ID` with `DB_QueryBound`; remaining `DB_Query` builds in this file may still use string SQL for stats filters |

## API notes

- Helpers live in `src/include/functions_db.php`: `DB_QueryBound()`, `DB_ExecBound()`, `UltraStats_SqlLikeContainsPattern()`.
- **mysqlnd** is required for `DB_QueryBound()` (`mysqli_stmt_get_result()`). The Docker PHP 8.2 image includes mysqlnd.
- `LIKE` “contains” search must escape `%`, `_`, `\` in the user fragment before binding; use `UltraStats_SqlLikeContainsPattern()`.

## Follow-up candidates

- `src/install.php` — optional: prepared/bound `INSERT` for config rows if the install wizard is refactored for non-admin use
- Remaining `functions_frontendhelpers.php` / `functions_common.php` queries where `serverwherequery` or time filters are built as strings
- Other admin front pages not covered in the table above
