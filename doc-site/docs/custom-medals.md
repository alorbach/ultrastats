# Custom medals (config file)

You can add **site-local medals** without editing the core `functions_parser-medals.php`. Definitions live in an optional PHP file that UltraStats loads if present.

The reference implementation is [`src/contrib/config.custommedals.sample.php`](https://github.com/alorbach/ultrastats/blob/main/src/contrib/config.custommedals.sample.php) in the source tree (six COD / UO / 2 style weapon–top medals from a community mod).

---

## Step-by-step (using the sample)

Follow these in order the first time you enable custom medals.

1. **Copy the sample to an active config file**  
   - Copy `src/contrib/config.custommedals.sample.php` to **`config.custommedals.php`**.  
   - Place it in **either** location (only one file is used; the app root wins if both exist):  
     - **Preferred:** next to `config.php` (e.g. `src/config.custommedals.php` when `src` is the document root).  
     - **Alternative:** `src/contrib/config.custommedals.php` (same folder as the sample).  

2. **Images**  
   - The six matching PNGs are shipped as `src/images/medals/normal/medal_custom_*.png` (defaults are copies of `medal_generic.png`).  
   - Replace any file with your own art if you want; filenames must match the medal **id** (e.g. `medal_custom_ppsh.png`).

3. **Admin: turn medals on**  
   - Open **Admin → General Options**.  
   - Under the medal list, set each `medal_custom_*` entry you want to **enabled** (and enable **medals** on the main page if you use the default home layout).

4. **Recalculate medals**  
   - Run a full parse, or use **Calculate medals only** (from the server / parser admin tools) so `stats_consolidated` is updated for your servers.

5. **Check the site**  
   - The home page should show a **Custom Medals** block below **Pro Medals** when at least one custom medal has data.  
   - Detail view: `medals.php?id=medal_custom_ppsh` (use your medal id).

---

## How the sample file works: one medal, line by line

The file is **included** by UltraStats; it is not run standalone. The header at the top of [`config.custommedals.sample.php`](https://github.com/alorbach/ultrastats/blob/main/src/contrib/config.custommedals.sample.php) documents that **`$content`**, **`$serverid`**, **`$szTimeFilter`**, and table constants (e.g. `STATS_PLAYER_KILLS`) are already set by `LoadCustomMedalsConfig` / `CreateMedalsSQLCode`.

**Security guard (required):**

```php
if ( ! defined( 'IN_ULTRASTATS' ) ) {
	die( 'Hacking attempt' );
	exit;
}
```

**Example: the PPSH medal** — array key = **medal id** (used in the DB, URLs, and image name `medal_custom_ppsh.png`):

| What you set | In the sample | Meaning |
|----------------|---------------|--------|
| `DisplayName` | `'PPSH Medal'` | Shown in the UI and in admin. |
| `GroupedPlayerID` | `'PLAYERID'` | **Required:** v1 only supports this; the query must reward one player. |
| `value_label` | `'Kills'` | Text stored with the winning value (e.g. “Kills: 123”). |
| `description_id` | `'medal_custom_ppsh'` | Looked up in the string database for the long description; if missing, you see “no description”. |
| `sort_id` | `200` | Order on the home page and in `stats_consolidated` (use 200+ for customs; use unique values per medal). |
| `sql` | `SELECT … ORDER BY AllKills` | **Do not** add `LIMIT` here. The parser appends ` DESC LIMIT 1` and picks the top player. The result must include **`PLAYERID`** and **`AllKills`** (sum of kills for that group). |

**Copying a medal to add your own:** duplicate one block, change the key to `medal_custom_<slug>`, set a new `sort_id`, adjust `DisplayName` / `description_id` / `sql`, and add `images/medals/normal/medal_custom_<slug>.png`.

---

## Full SQL for the PPSH medal (from the sample)

The `sql` value in [`config.custommedals.sample.php`](https://github.com/alorbach/ultrastats/blob/main/src/contrib/config.custommedals.sample.php) is built in PHP. Table names come from `functions_common.php` (e.g. `STATS_PLAYER_KILLS` is the table prefix from `config.php` plus `player_kills`, so default **`stats_player_kills`**; same idea for `stats_weapons` and `stats_rounds`).

### 1. What each concatenated part does

| Part of the `sql` string | Role |
|----------------------------|------|
| `'SELECT ' . … PLAYERID` | Picks the **player** who will “win” the medal. Must stay **`PLAYERID`** for custom medals in v1. |
| `sum(… .Kills) as AllKills` | **Total kills** in scope (weapon filter + server + bans + time). The alias **`AllKills`** is required: the parser reads this column. |
| `' FROM ' . STATS_PLAYER_KILLS` | One row in this table = kills attributed to a player in a round (with weapon, etc.). This is the fact table for the medal. |
| `INNER JOIN (STATS_WEAPONS, STATS_ROUNDS)` + `ON …` | Restricts rows to kill events that (a) have a real **weapon** row, (b) belong to a real **round** row, and (c) match `WEAPONID` and `ROUNDID` foreign keys. Drops orphan or inconsistent rows. |
| `WHERE … INGAMENAME IN ('ppsh_mp')` | Only kills made with the **in-game weapon name** the parser stored (here the COD1/UO/2 PPSH). Other medals in the sample only change this list, e.g. `bar_mp`, `bren_mp`, or several names for “sub machinegun”. |
| `GetCustomServerWhereQuery(STATS_PLAYER_KILLS, false, false, $serverid)` | Adds **`AND`** … **`SERVERID =`** the current server id on the **player_kills** table when medals are calculated **per server** (normal case). The second argument is `false`, so the fragment starts with **`AND`**, not a second `WHERE` (the sample already opened `WHERE` with the weapon filter). If there is no single server context, this may output nothing. |
| `GetBannedPlayerWhereQuery(STATS_PLAYER_KILLS, 'PLAYERID', false)` | If the site has **banned player** GUIDs/IDs in config, adds **`AND player_kills.PLAYERID NOT IN (…)`** so banned players never win a medal. Otherwise adds nothing. |
| `$szTimeFilter` | Optional extra **`AND`** conditions on the **round** time range when the medal SQL is built with a **time filter**; during a normal “calculate medals” run this is often **empty**. |
| `GROUP BY … PLAYERID` | Collapses to **one row per player**: the sum of `Kills` is their total for this weapon/scope. |
| `ORDER BY AllKills` | Orders by the alias; the parser will sort **descending** in the next step. |

**Important:** the string in the config file ends with `ORDER BY AllKills` only. The medal engine in `CreateAllMedals` **concatenates** ` . " DESC LIMIT 1"` to that string before it runs, so the database returns the **single top player** (highest `AllKills`). That is why you must not put `LIMIT` in the config yourself.

### 2. The same query in plain SQL (illustrative)

After PHP expands table names and helpers, the shape looks like this (simplified: real `AND` fragments depend on your server id, ban list, and time filter):

```sql
SELECT
  stats_player_kills.PLAYERID,
  SUM(stats_player_kills.Kills) AS AllKills
FROM stats_player_kills
INNER JOIN (stats_weapons, stats_rounds)
  ON (
    stats_weapons.ID = stats_player_kills.WEAPONID
    AND stats_player_kills.ROUNDID = stats_rounds.ID
  )
WHERE stats_weapons.INGAMENAME IN ('ppsh_mp')
  /* AND stats_player_kills.SERVERID = <serverid>   -- from GetCustomServerWhereQuery when applicable */
  /* AND stats_player_kills.PLAYERID NOT IN (...)  -- from GetBannedPlayerWhereQuery if bans exist */
  /* AND <round time conditions>                    -- from $szTimeFilter if non-empty */
GROUP BY stats_player_kills.PLAYERID
ORDER BY AllKills DESC
LIMIT 1;
```

**What the config file contains vs. the engine:** your `sql` string ends with `ORDER BY AllKills` (ascending by default). `CreateAllMedals` then **appends the exact suffix** ` DESC LIMIT 1` (space, `DESC`, `LIMIT 1`) so the executed query matches the form above. That suffix is **not** part of `config.custommedals.php` and must not be duplicated in the file.

### 3. How the result is used

`ReturnMedalValue` runs the final SQL and reads **one** row. `InsertOrUpdateMedalValue` then stores `PLAYERID`, `AllKills`, and the medal id into **`stats_consolidated`** (with your display name, sort order, etc.) for the current server’s medal pass.

### 4. The other five medals in the file

The **shape** of the query is the same: `SELECT` / `FROM` / `INNER JOIN` / `WHERE INGAMENAME IN (…)` / the same three helper calls / `GROUP BY` / `ORDER BY AllKills`. Only the **weapon name list** in `IN (…)` and the **`sort_id`** (201–205) differ from the PPSH example.

---

## Medal IDs and main page

- Use the prefix **`medal_custom_`** and a short slug (letters, numbers, underscore), e.g. `medal_custom_ppsh`.  
- The main page shows a **Custom Medals** section when at least one `medal_custom%` row exists in the consolidated table (and medals are enabled).  
- **Block order** on the home page: **Pro Medals** → **Anti Medals** (if enabled) → **Custom Medals**.

## Descriptions in the database

`description_id` is resolved with the same mechanism as other medals: `STRINGID` in the language string table. If there is no row, the card shows the generic “no description” line. Add text via the admin string editor, or point `description_id` at an existing `STRINGID` you already use.

## Security

`config.custommedals.php` is **PHP** on the server. Only trusted administrators should edit it. Bad SQL can break the parser or, in the worst case, leak data—treat it like any other custom PHP in your install.
