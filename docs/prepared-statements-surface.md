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

*Note:* A file can appear in **Migrated** and still have unmigrated `DB_Query` calls elsewhere in the file—the **Still using** section tracks remaining patterns, not a second count of the same line items.

## Still using `DB_Query` / string SQL (not exhaustive)

| Pattern | Examples |
|--------|----------|
| Large list/report queries | Some front/admin UIs (e.g. `rounds`, `index`) — often `intval` for limits; not fully audited to bound parameters |
| Install wizard (DDL only) | `src/install.php` step 5 — table/schema batch via `DB_Query(…, false)` (multi-statement import) |
| Aggregates / globals | `functions_frontendhelpers.php` — e.g. `GetAndSetMaxKillRation`, `GetAndSetGlobalInfo`: server/time/banned fragments still concatenated; `Kills` threshold cast to int in query |
| Time filter string | `functions_common.php` `GetTimeWhereQueryString` — appends `AND Time_Year = N` / `Time_Month = N` from session (int-cast; not placeholder-bound) |
| Banned filter | `functions_common.php` — `GetBannedPlayerWhereQuery` uses `NOT IN (…)`; GUID list is built from int-cast DB rows in `CreateBannedPlayerFilter` |
| mysqli helpers | `functions_db.php` — `DB_Query` / `DB_GetRowCount` / `DB_Exec` catch `mysqli_sql_exception` where applicable; `UltraStats_ValidateTablePrefix` |

## API notes

- Helpers live in `src/include/functions_db.php`: `DB_QueryBound()`, `DB_ExecBound()`, `UltraStats_SqlLikeContainsPattern()`.
- **mysqlnd** is required for `DB_QueryBound()` (`mysqli_stmt_get_result()`). The Docker PHP 8.2 image includes mysqlnd.
- `LIKE` “contains” search must escape `%`, `_`, `\` in the user fragment before binding; use `UltraStats_SqlLikeContainsPattern()`.

## Follow-up candidates

- `src/install.php` — only if desired: move DDL to a loader that also uses `mysqli` exception-safe paths consistently (large refactor)
- Remaining `functions_frontendhelpers.php` / `functions_common.php` queries where banned-player `NOT IN` lists, time slices in other helpers, or `serverwherequery` fragments are still string-built
- Other admin front pages not covered in the table above
