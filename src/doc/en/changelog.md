# Changelog

Release history. The same content is mirrored as **plain text** in `ChangeLog` at the repository root (used by the release workflow); this file is the **maintained Markdown** copy for readers and tools.

---

## Version 0.3.20, 2026-04-27

### New features

- **CI:** GitHub Actions publishes a release tarball (`git archive`) on `v*` tag pushes; release body combines ChangeLog excerpts with generated notes (`.github/scripts/build_release_body.py`); [README.md](../../../README.md) and [AGENTS.md](../../../AGENTS.md) document Releases.
- **Admin parser:** Server-Sent Events live log (`parser-sse`, shared `parser-core-operations` with `parser-core`); cooperative cancel (`parser-cancel.php`, tmp flag); batched monospace log UI; structured FTP/password prompts; dark-themed embed with viewport-clamped log panel (`defaults.css`, `parser.html`).
- **Admin parser (embedded SSE completion):** on successful stream end, sticky green **DONE** banner with optional elapsed time and link back to the server list (`LN_PARSER_DONE`, `LN_PARSER_RETURN_SERVERLIST` en/de); not shown on cancel, chained run-totals, or FTP/password-confirmation flows.
- **Log parser:** large-parse performance (parse-scoped lookup caches, set-based `CreateTopAliases` per server and for global **Run total stats**, batched `mysqli_multi_query` for queued `UPDATE`s, `INSERT … ON DUPLICATE KEY UPDATE` for player/time stats).
- **Log parser:** `JT` (join team); advanced round-action lines `FT`, `FR`, `FC`, `RC`, `RD`, `BP`, `BD` (CTF / KOTH / bomb events); **CoD:WaW** compact `W` / `L` win/loss lines when `gen_gameversion` is WaW.
- **Medals (CoD / UO / CoD2):** pro medals for shotgun, MG, Thompson (display), and Panzerschreck (weapon kill rankings).
- **Documentation:** maintainer deployment ([docs/maintainer-deployment.md](../../../docs/maintainer-deployment.md)), CSP staging ([docs/csp-staging.md](../../../docs/csp-staging.md)), prepared-statement inventory ([docs/prepared-statements-surface.md](../../../docs/prepared-statements-surface.md)); Docker rebuild helpers and gamelog resolution notes in [AGENTS.md](../../../AGENTS.md).

### Changes and bugfixes

- **PHP 8 / MySQLi:** `DB_Query` and `DB_Exec` catch `mysqli_sql_exception` so failures return `false` instead of fatals; `DB_GetRowCount` hardened; `DB_GetRowCountBound` for filtered list counts.
- **Security / SQL:** `password_hash` / `password_verify` with MD5 fallback; bound parameters and safer patterns across admin lists (players, strings, servers), `GetPlayerHtmlNameFromID`, install paths, `FillPlayerWithAlias` / `FillPlayerWithTime`, `FindAndFillWithTime` (dynamic `IN`), `FindAndFillTopAliases`, `CreateBannedPlayerFilter` (int-cast GUIDs), rounds gametype filter + `LIMIT`, index/top-players thresholds, `GetAndSetGlobalInfo` and `GetAndSetMaxKillRation` integer casting; `UltraStats_SqlLikeContainsPattern` for `LIKE`; `WriteConfigValue` escapes name/value and handles empty `SELECT` results.
- **Install:** `UltraStats_ValidateTablePrefix` before prefixed DDL; `gen_gameversion` and `database_installedversion` via `DB_ExecBound` after schema batch; upgrade runner accepts single-statement `db_update_*.txt` files (statement count check uses `< 1`); web installer chooses **InnoDB** (default) or **MyISAM** for new tables (`TYPE=MyISAM` in schema rewritten to `ENGINE=…`); `config.sample.php` includes informational `DBStorageEngine`; `UltraStats_NormalizeStorageEngine` / `UltraStats_ApplyStorageEngineToSchemaSql` in `functions_db.php`.
- **Docker:** `seed-database.php` honors `ULTRASTATS_DB_STORAGE_ENGINE` (default **InnoDB**).
- **Parser / aliases:** correct empty result handling after `DB_GetAllRows()` (`!empty` vs `isset`) in parser, consolidation, and admin server lookup; `UltraStats_Utf8StringForDatabase` + utf8mb4-safe alias `INSERT`/`WHERE` (fixes MySQL 1366 on non-ASCII log names); avoid indexing missing `SERVER` rows in admin parser.
- **Database internal versions 8–13** (template + `db_update_*.txt`): v8 schema/config alignment with hardened mysqli paths; v9 widen `stats_aliases.AliasChecksum` to `INT` unsigned; v10 `stats_aliases` index; v11 indexes on `stats_player_kills` and `stats_rounds`; v12 **CoD:WaW** `stats_maps` `REPLACE` seeds (`db_update_v12.txt` + `db_template.txt`); v13 index `idx_aliases_playerid_alias` (`PLAYERID`, `Alias`) for global `CreateTopAliases`.
- **Docker:** `seed-database.php` CoD4-oriented import, latin1 SQL loads, sample servers and dev admin user; `UltraStats_ResolveGamelogLocation` for relative gamelog paths from app root; `server_total_ratio` consolidation when no players exist.
- **rounds-detail.php:** fixed PHP 8 fatal when a round has no round-action rows (empty `gameactions` still passed `isset()` but never populated `$content['gameactions']`).
- **rounds-detail.php:** initialize `$AllPlayers` and skip medal/awards when there are no players; harden `GetRoundPlayerDetails` when the kills query returns no mysqli result.
- **damagetypes.php:** default `mostskills_maxkills` / `killedby_maxkills` to `0` when grouped kill queries return no rows (fixes PHP 8 `array offset on null` warnings).
- **Schema seed:** remove duplicate `stats_maps` `INSERT` for `mp_subway` from `db_template_cod4only.txt` (row already in base template / WaW seeds) so install / `seed-database.php` does not fail with duplicate key `MAPNAME_UNIQUE`.

## Version 0.3.14, 2026-04-26

### New features

- Documented project for PHP 7.4+ / MySQL 8, Docker dev stack, and security in [README.md](../../README.md), [AGENTS.md](../../AGENTS.md), [SECURITY.md](../../SECURITY.md), and [`.agent/`](../../.agent/README.md) skills.
- Replaced `ext/mysql` with **mysqli**; **prepared statements** for high-risk web/admin SQL (`find-chat`, `find-players`, user admin, parser server lookup).

### Changes and bugfixes

- Hardened redirects and sessions; chat/player search and admin user flows use **bound parameters**; schema adjustments for **MySQL 8** (e.g. utf8mb4 index limits).
- Bundled static docs in **`src/doc/en/`** converted to **Markdown**; [Content-Security-Policy](../../SECURITY.md#content-security-policy) guidance added for operators.
- Assorted front-end and empty-result SQL fixes for PHP 8 / MySQL 8 (e.g. `IN ()` guards).

## Version 0.3.13 (beta), 2008-11-30

### New features

- Added icons for game versions to the top left on the menubar.
- Added `SQL_BIG_SELECTS` workaround for certain databases.
- Number of top players on the main page is configurable now.
- Added search page for searching in the chat logs.
- Added workaround for changed `ACTION` logging format of Pam4 in CoD4. However, Pam4 still breaks the log format in a way that some features (e.g. chat logging) will not work with PAM4.

### Changes and bugfixes

- Fixed PHP4 compatibility issues in the log parser.
- Fixed donate button.
- Added database upgrade V7, including important changes in the database. Also adds missing weapons, maps, and other content automatically, including on existing installations.
- Fixed SD gametype default for CoD:WW; empty gametypes are displayed with gametype id on the main page now.
- Fixed "WTF OMFG" error when player time was 0 seconds (e.g. client disconnected immediately).
- Fixed strange increment error in `install.php`.

## Version 0.3.12 (beta), 2008-11-18

### New features

- Added new general frotnend options, to inject html code at certain
    places, prepend a string in the title tag and customize the
    UltraStats Logo url.
- Added help text for FTP Create button.
- Added display of the current configured game.
- Added check if gamelogfile is actually writeable.
- Added quick and dirty support for download gamelogfiles over http.
    Just a fully qualified http url instead of ftp, the stats parser
    automatically detect.
### Changes and bugfixes

- Fixed Sniper Medal for Codww
- Removed some minor issues with missing templates variables.
- Fixed serious security issue of reading the serverid parameter.
- Fixed problem with session initialization on Microsoft IIS Webservers.
- Fixed a problem in the default db templates, causing some mysql 4
    version to fail durign installation.
- Added support to display new weapon ids proberly and correct.
- Fixed minor notice bug when reading script timeout from db settings.
- Fixed PB Guid detection string
- Fixed Knife medal for CodWW and fixed minor bug in the medals
    page template.
- Fix detection of command line mode, which also fixes php
    session management.
- Added fix for "SQL_BIG_SELECT" errors in logparser.

## Version 0.3.11 (beta), 2008-10-05

### Changes and bugfixes

- Fixed race condition, when a new logfile is used the LastLogLine
    was only reseted internal. We are reseting the playedseconds as well now.
- Fixed typing issues and removed notices issues
- Changed display name of Marine Soldier to American Soldier
- Removed TM from frontpage logo
- Fixed RoundEnd Detection in Parser, which caused following errors.

## Version 0.3.10 (beta), 2008-10-04

### New features

- Added missing .357 Magnum Pistol including images and description.
### Changes and bugfixes

- Calculation of time (roundbegin) has been hardened and corrected against
    large logfiles which contain server restarts. Added two new fields
    into Server Table needed for this and future enhancments.
- Removed some obselete weapons from template database
- All fopen calls changed to use @fopen, this avoids php warnings

## Version 0.3.9 (beta), 2008-10-03

### Changes and bugfixes

- Replaced all weapon images with new rendered weapn images from the
    final game. Added lots of missing images as well.
- Fixed all references to Call of Duty: World ar War.
- Fixed minor spelling issues in default database template
- Removed old obselete documentation.
- Session Startup is done in every site now!

## Version 0.3.8 (beta), 2008-10-01

### New features

- Added few missing language strings for certain existing and new weapons.
- Added README document
- Added images for certain existing and new weapons
### Changes and bugfixes

- Lots of fixes in the weapon table, replaced some of the existing
    weapon images with better ones.
- Added new attachment images
- Removed ANTI Medals from code for now.
- Fixed minor installer issues and enhanced critical error messages.
- Changed few minor things in the docs and about page

## Version 0.3.7 (devel), 2008-09-30

### New features

- Added some german translation
- Added warning if FTP Extensions are disabled!
- Enhanced database query performance in player admin
- Show found player number in player admin
- Prepared time filter for consolidation table
### Changes and bugfixes

- Fixed GUID issues bug in player admin causing failed edits of some players
- Fixed minor issues if new gametypes were added, no displayname was used
- Fixed lots of minor display issues and minor template issues
- Cleaned up gametypes in default database template
- Removed useless default charset from tabel defs

## Version 0.3.6 (devel), 2008-09-29

### New features

- Added missing map picture for airfield
### Changes and bugfixes

- Fixed minor sql issues in medal statements
- Fixed sort order of available stats years and months
- fixed misspelled svt40 images
- Set default bar images for players without kills
- Added result workaround for TDM gametype in Cod:WW
- Added missing weapons into default sql statement set
- Changed artillery text
- Unknown alias is now displayed with -Topalias Unknown-

## Version 0.3.5 (devel), 2008-09-28

### New features

- Added new default theme called "codww" which is like the current
    www.callofduty.com style.
- Implemented Update Check feature which is performed when the user logs
    into the admin center. If an update is available, the user will be
    reminded on each admin page.
- Added option to set php script execution timeout, if possible.
    This will help people who have to parse the logfile
    using the webserver.
- Links within text description are parsed and modified, so that always
    open in a new window.
- Implemented time filter into medal code. All sql statements had
    to be modified for this to work.
### Changes and bugfixes

- Fixed some sql statement issues
- Added additional pager template, forgot to add in last version
- Fixed typo of table name when deleting a player in admin/players.php

## Version 0.3.4 (devel), 2008-09-24

### New features

- Implemented Time Filtering which can be selected now on the left
    side below the menu. The time filtering can go down to year and month
    level. Available years and month will automatically be generated by
    the statsdata.
- Also cleaned up the template coding, replaced the default error display,
    and added more useful error description in certain places.
- Added submenu option into pager include. Added available gametypes
    menu into round list.
- Damagetype and Weapon lists are now stored in helper tables, the data
    is consolidated in the Total/Final Calculations but can also be done
    seperated in the Serverlist Menu. This improves performance for
    stats display on larger databases.
- Also added some more popup help texts in certain areas.
- Fixed a few minor isses in the css and templates.

## Version 0.3.3 (devel), 2008-09-21

### New features

- Added 4 new Player Models for Cod:WW, and rewrote the hitdetection
    model view in the player details. Details are now shown in a popup
    when you hover the body parts. It is also possible to configure
    which model you want to use in the player details:
    marine, german, japanese and russian.
- Added german translation
- Added support to enable GZIP compression. This can be used to reduce
    outgoing html traffic.
### Changes and bugfixes

- LogParser: Added workaround to add players into a running round which did not join before. This workaround is only applied in the KILL log line for now.
- Fixed few minor display and visiblity issues in the stats
- Changed some debug levels in the parser. Default debug level is
    restricted to more useful output now.
- Fixed readability issue in dark style
- Added menu workaround for Internet Explorer, so it works there as well.
- Fixed default picture in serverlist view
- LogParser: Rewrote round begin and round end detection to
    work with new Cod:WW Gametypes.
- LogParser: Fixed a bug in the custom time start detection method
    using the gamestartup variable workaround.
- LogParser: Fixed a roundstart time calculation bug which caused
    played rounds to appear in the future.

## Version 0.3.2 (devel), 2008-09-18

### New features

- Initial Changelog entry for the third UltraStats release
- Added support for Cod:WW (Call of Duty: World at War)
- Added map images for Cod:WW
- Added weapon images for Cod:WW
- Added string editor in Admin Center
- Implemented new css based menu into UltraStats
- Enhanced and cleaned up the basic "default" and "dark"
- Added support to LIST weapons and damagetypes on ONE site
- Added favicon.ico
### Changes and bugfixes

- Added new Installations instructions document called "INSTALL"
- Added GPLv3 document "COPYING"
- Removed unused files, fixed pager in stringeditor and minor
    other visual tweaks
- Removed unsupported languages and themes for now.
    Going to add them back in a later step
- Enhanced AdminMenu, fixed a few style sheet bugs
- Fixed minor issue with includes and server deletion
- ini_set commands won't create an error now
- Removed Windows linefeeds from include files
- Enhanced the UltraStats installer, better error handling now!
- Fixed issue of showing PBGUid Field when no PBGuid was available
- Fixed wrong sized thmbnails for custom maps
- Fixed bug in INSERT statement of server admin
- Fixed a bug of players which were not displayed on the detail page.
    Only happened if there GUID was empty.
- Fixed leaking DB handle in GetSingleDBEntryOnly
- Removed useless files like multiple Thumbs.db occurences
- Removed old cvs crap (using git now ;) )!

