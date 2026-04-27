-- UltraStats: EXPLAIN baseline for parser / front-end hot paths (MySQL 8+).
-- Run after applying db_update_v13 (or fresh install with indexes). Replace stats_ if your TBPref differs.
--
-- 1) Round-scoped player kills (parser delete, rounds-detail, similar)
EXPLAIN SELECT ID, PLAYERID, ENEMYID, Kills FROM stats_player_kills WHERE SERVERID = 1 AND ROUNDID = 1 LIMIT 50;

-- 2) Rounds list by server + time (typical ORDER BY TIMEADDED)
EXPLAIN SELECT ID, TIMEADDED, MAPID FROM stats_rounds WHERE SERVERID = 1 ORDER BY TIMEADDED DESC LIMIT 50;

-- 3) CreateTopAliases per-server: alias_sums CTE (SERVERID = 1) — see functions_parser-helpers CreateTopAliases
EXPLAIN SELECT a.PLAYERID, a.ID AS ALIASID, SUM(a.Count) AS MyCount
FROM stats_aliases a
WHERE a.SERVERID = 1
GROUP BY a.PLAYERID, a.Alias
ORDER BY a.PLAYERID, MyCount DESC;

-- 4) CreateTopAliases global (RunTotalStats, SERVERID = -1): GROUP BY across all servers; uses idx_aliases_playerid_alias
EXPLAIN WITH alias_sums AS (
  SELECT PLAYERID, `Alias`, SUM(`Count`) AS MyCount, MAX(ID) AS AliasRowId
  FROM stats_aliases
  GROUP BY PLAYERID, `Alias`
),
ranked AS (
  SELECT PLAYERID AS GUID, AliasRowId AS ALIASID,
    ROW_NUMBER() OVER (PARTITION BY PLAYERID ORDER BY MyCount DESC, AliasRowId DESC) AS rn
  FROM alias_sums
)
SELECT r.GUID, -1, r.ALIASID
FROM ranked r
INNER JOIN (SELECT GUID FROM stats_players GROUP BY GUID) p ON p.GUID = r.GUID
WHERE r.rn = 1;
