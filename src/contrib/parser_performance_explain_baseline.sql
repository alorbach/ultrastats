-- UltraStats: EXPLAIN baseline for parser / front-end hot paths (MySQL 8+).
-- Run after applying db_update_v11 (or fresh install with indexes). Replace stats_ if your TBPref differs.
--
-- 1) Round-scoped player kills (parser delete, rounds-detail, similar)
EXPLAIN SELECT ID, PLAYERID, ENEMYID, Kills FROM stats_player_kills WHERE SERVERID = 1 AND ROUNDID = 1 LIMIT 50;

-- 2) Rounds list by server + time (typical ORDER BY TIMEADDED)
EXPLAIN SELECT ID, TIMEADDED, MAPID FROM stats_rounds WHERE SERVERID = 1 ORDER BY TIMEADDED DESC LIMIT 50;

-- 3) CreateTopAliases-style: top alias per player by sum(Count) — pattern used after rewrite validation
EXPLAIN SELECT a.PLAYERID, a.ID AS ALIASID, SUM(a.Count) AS MyCount
FROM stats_aliases a
WHERE a.SERVERID = 1
GROUP BY a.PLAYERID, a.Alias
ORDER BY a.PLAYERID, MyCount DESC;
