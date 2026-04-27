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
| Install config (step 5) | `src/install.php` | After DDL loop, `DB_ExecBound` for `gen_gameversion` and `database_installedversion`; `UltraStats_ValidateTablePrefix` on `DB_PREFIX` before schema replace and inserts |
| Player display name by id | `functions_common.php` `GetPlayerHtmlNameFromID()` | `PLAYERID` and optional `SERVERID` bound |
| Frontend helpers (partial) | `functions_frontendhelpers.php` | `GetAndSetCurrentServer`, `FillPlayerWithAlias`, `FillPlayerWithTime`, `GetTextFromDescriptionID`, `FindAndFillTopAliases`, `FindAndFillWithTime` (bound `IN` for bulk player time) use bound params where shown in code; other queries in the same file may still use `DB_Query` (see below) |
| Rounds list (partial) | `src/rounds.php` | `?id=` gametype `NAME = ?` bound; paged `LIMIT ? , ?` bound; `DB_GetRowCountBound` for filtered count; other fragments (server/time) unchanged |
| Home index (partial) | `src/index.php` | Top-players list: `web_minkills` / `web_mainpageplayers` as `(int)` in SQL; remaining blocks still `DB_Query` (consolidated / medals / server) |
| Server scoping in SQL | `functions_common.php` `GetCustomServerWhereQuery()` | `SERVERID` in `AND` / `WHERE` uses `(int) $content['serverid']` or int `customserverid` |

*Note:* A file can appear in **Migrated** and still have unmigrated `DB_Query` calls elsewhere in the file—the **Still using** section tracks remaining patterns, not a second count of the same line items.

## Still using `DB_Query` / string SQL (not exhaustive)

| Pattern | Examples |
|--------|----------|
| Large list/report queries | `src/index.php` home blocks (last rounds, server totals, medals, server list) still `DB_Query` with helper fragments; `rounds` gametype filter + paging bound as above |
| Install wizard (DDL only) | `src/install.php` step 5 — one statement per `DB_Query(…, false)`; `DB_Query` catches `mysqli_sql_exception` (see comment above DDL loop) |
| Aggregates / globals | `functions_frontendhelpers.php` — e.g. `GetAndSetMaxKillRation`, `GetAndSetGlobalInfo`: `DB_Query` with fixed `LIKE` / consolidated time / `GetCustomServerWhereQuery` (int server id); not placeholder-bound end-to-end |
| Time filter string | `functions_common.php` `GetTimeWhereQueryString` — appends `AND Time_Year = N` / `Time_Month = N` from session (int-cast; not placeholder-bound) |
| Banned filter | `functions_common.php` — `GetBannedPlayerWhereQuery` uses `NOT IN (…)`; GUID list is built from int-cast DB rows in `CreateBannedPlayerFilter` |
| mysqli helpers | `functions_db.php` — `DB_Query` / `DB_GetRowCount` / `DB_Exec` catch `mysqli_sql_exception` where applicable; `UltraStats_ValidateTablePrefix` |

## API notes

- Helpers live in `src/include/functions_db.php`: `DB_QueryBound()`, `DB_ExecBound()`, `DB_GetRowCountBound()` (row count for bound `SELECT`), `UltraStats_SqlLikeContainsPattern()`.
- **mysqlnd** is required for `DB_QueryBound()` (`mysqli_stmt_get_result()`). The Docker PHP 8.2 image includes mysqlnd.
- `LIKE` “contains” search must escape `%`, `_`, `\` in the user fragment before binding; use `UltraStats_SqlLikeContainsPattern()`.

## Follow-up candidates

- `src/install.php` — optional large refactor: split/execute DDL differently; current loop already relies on `DB_Query`’s `mysqli_sql_exception` handling
- `functions_frontendhelpers.php` / `functions_common.php` — full placeholder binding for `GetTimeWhereQueryString` / `GetTimeWhereConsolidatedQueryString` + `NOT IN` would require new helper APIs; banned GUID list and server id are int-safe
- Other admin front pages not covered in the table above
