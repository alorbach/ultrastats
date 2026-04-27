<?php
/*
 * Copy this file to ../config.custommedals.php (next to config.php) and adjust.
 * Medal image files: images/medals/normal/<NAME>.png (e.g. medal_custom_ppsh.png).
 *
 * Based on weapon-top medals from mod-sanetti.david-src (COD / CODUO / COD2 weapon names).
 * Requires IN_ULTRASTATS when included from UltraStats.
 */

if ( ! defined( 'IN_ULTRASTATS' ) ) {
	die( 'Hacking attempt' );
	exit;
}

/* $content, $serverid, $szTimeFilter and table constants are provided by CreateMedalsSQLCode / LoadCustomMedalsConfig. */

$content['medals']['medal_custom_ppsh']['DisplayName']       = 'PPSH Medal';
$content['medals']['medal_custom_ppsh']['GroupedPlayerID']   = 'PLAYERID';
$content['medals']['medal_custom_ppsh']['value_label']       = 'Kills';
$content['medals']['medal_custom_ppsh']['description_id']   = 'medal_custom_ppsh';
$content['medals']['medal_custom_ppsh']['sort_id']           = 200;
$content['medals']['medal_custom_ppsh']['sql']               = 'SELECT ' .
			STATS_PLAYER_KILLS . '.PLAYERID, ' .
			' sum(' . STATS_PLAYER_KILLS . '.Kills) as AllKills' .
			' FROM ' . STATS_PLAYER_KILLS .
			' INNER JOIN (' . STATS_WEAPONS . ', ' . STATS_ROUNDS .
			') ON (' .
			STATS_WEAPONS . '.ID=' . STATS_PLAYER_KILLS . '.WEAPONID AND ' .
			STATS_PLAYER_KILLS . '.ROUNDID=' . STATS_ROUNDS . '.ID ' .
			') ' .
			' WHERE ' . STATS_WEAPONS . ".INGAMENAME IN ('ppsh_mp') " .
			GetCustomServerWhereQuery( STATS_PLAYER_KILLS, false, false, $serverid ) .
			GetBannedPlayerWhereQuery( STATS_PLAYER_KILLS, 'PLAYERID', false ) .
			$szTimeFilter .
			' GROUP BY ' . STATS_PLAYER_KILLS . '.PLAYERID ' .
			' ORDER BY AllKills';

$content['medals']['medal_custom_submachinegun']['DisplayName']     = 'Sub Machinegun';
$content['medals']['medal_custom_submachinegun']['GroupedPlayerID'] = 'PLAYERID';
$content['medals']['medal_custom_submachinegun']['value_label']     = 'Kills';
$content['medals']['medal_custom_submachinegun']['description_id']  = 'medal_custom_submachinegun';
$content['medals']['medal_custom_submachinegun']['sort_id']         = 201;
$content['medals']['medal_custom_submachinegun']['sql']             = 'SELECT ' .
			STATS_PLAYER_KILLS . '.PLAYERID, ' .
			' sum(' . STATS_PLAYER_KILLS . '.Kills) as AllKills' .
			' FROM ' . STATS_PLAYER_KILLS .
			' INNER JOIN (' . STATS_WEAPONS . ', ' . STATS_ROUNDS .
			') ON (' .
			STATS_WEAPONS . '.ID=' . STATS_PLAYER_KILLS . '.WEAPONID AND ' .
			STATS_PLAYER_KILLS . '.ROUNDID=' . STATS_ROUNDS . '.ID ' .
			') ' .
			' WHERE ' . STATS_WEAPONS . ".INGAMENAME IN ('bar_mp', '30cal_stand_mp', 'bar_slow_mp', 'thompson_mp', 'greasegun_mp', 'mp40_mp', 'ppsh_mp', 'PPS42_mp', 'sten_mp') " .
			GetCustomServerWhereQuery( STATS_PLAYER_KILLS, false, false, $serverid ) .
			GetBannedPlayerWhereQuery( STATS_PLAYER_KILLS, 'PLAYERID', false ) .
			$szTimeFilter .
			' GROUP BY ' . STATS_PLAYER_KILLS . '.PLAYERID ' .
			' ORDER BY AllKills';

$content['medals']['medal_custom_barmaster']['DisplayName']     = 'Bar Master';
$content['medals']['medal_custom_barmaster']['GroupedPlayerID'] = 'PLAYERID';
$content['medals']['medal_custom_barmaster']['value_label']     = 'Kills';
$content['medals']['medal_custom_barmaster']['description_id']  = 'medal_custom_barmaster';
$content['medals']['medal_custom_barmaster']['sort_id']         = 202;
$content['medals']['medal_custom_barmaster']['sql']             = 'SELECT ' .
			STATS_PLAYER_KILLS . '.PLAYERID, ' .
			' sum(' . STATS_PLAYER_KILLS . '.Kills) as AllKills' .
			' FROM ' . STATS_PLAYER_KILLS .
			' INNER JOIN (' . STATS_WEAPONS . ', ' . STATS_ROUNDS .
			') ON (' .
			STATS_WEAPONS . '.ID=' . STATS_PLAYER_KILLS . '.WEAPONID AND ' .
			STATS_PLAYER_KILLS . '.ROUNDID=' . STATS_ROUNDS . '.ID ' .
			') ' .
			' WHERE ' . STATS_WEAPONS . ".INGAMENAME IN ('bar_mp', 'bar_slow_mp') " .
			GetCustomServerWhereQuery( STATS_PLAYER_KILLS, false, false, $serverid ) .
			GetBannedPlayerWhereQuery( STATS_PLAYER_KILLS, 'PLAYERID', false ) .
			$szTimeFilter .
			' GROUP BY ' . STATS_PLAYER_KILLS . '.PLAYERID ' .
			' ORDER BY AllKills';

$content['medals']['medal_custom_brenmaster']['DisplayName']     = 'Bren Master';
$content['medals']['medal_custom_brenmaster']['GroupedPlayerID'] = 'PLAYERID';
$content['medals']['medal_custom_brenmaster']['value_label']     = 'Kills';
$content['medals']['medal_custom_brenmaster']['description_id']  = 'medal_custom_brenmaster';
$content['medals']['medal_custom_brenmaster']['sort_id']         = 203;
$content['medals']['medal_custom_brenmaster']['sql']             = 'SELECT ' .
			STATS_PLAYER_KILLS . '.PLAYERID, ' .
			' sum(' . STATS_PLAYER_KILLS . '.Kills) as AllKills' .
			' FROM ' . STATS_PLAYER_KILLS .
			' INNER JOIN (' . STATS_WEAPONS . ', ' . STATS_ROUNDS .
			') ON (' .
			STATS_WEAPONS . '.ID=' . STATS_PLAYER_KILLS . '.WEAPONID AND ' .
			STATS_PLAYER_KILLS . '.ROUNDID=' . STATS_ROUNDS . '.ID ' .
			') ' .
			' WHERE ' . STATS_WEAPONS . ".INGAMENAME IN ('bren_mp') " .
			GetCustomServerWhereQuery( STATS_PLAYER_KILLS, false, false, $serverid ) .
			GetBannedPlayerWhereQuery( STATS_PLAYER_KILLS, 'PLAYERID', false ) .
			$szTimeFilter .
			' GROUP BY ' . STATS_PLAYER_KILLS . '.PLAYERID ' .
			' ORDER BY AllKills';

$content['medals']['medal_custom_garand']['DisplayName']     = 'Garand Lover';
$content['medals']['medal_custom_garand']['GroupedPlayerID'] = 'PLAYERID';
$content['medals']['medal_custom_garand']['value_label']     = 'Kills';
$content['medals']['medal_custom_garand']['description_id']  = 'medal_custom_garand';
$content['medals']['medal_custom_garand']['sort_id']         = 204;
$content['medals']['medal_custom_garand']['sql']             = 'SELECT ' .
			STATS_PLAYER_KILLS . '.PLAYERID, ' .
			' sum(' . STATS_PLAYER_KILLS . '.Kills) as AllKills' .
			' FROM ' . STATS_PLAYER_KILLS .
			' INNER JOIN (' . STATS_WEAPONS . ', ' . STATS_ROUNDS .
			') ON (' .
			STATS_WEAPONS . '.ID=' . STATS_PLAYER_KILLS . '.WEAPONID AND ' .
			STATS_PLAYER_KILLS . '.ROUNDID=' . STATS_ROUNDS . '.ID ' .
			') ' .
			' WHERE ' . STATS_WEAPONS . ".INGAMENAME IN ('m1garand_mp') " .
			GetCustomServerWhereQuery( STATS_PLAYER_KILLS, false, false, $serverid ) .
			GetBannedPlayerWhereQuery( STATS_PLAYER_KILLS, 'PLAYERID', false ) .
			$szTimeFilter .
			' GROUP BY ' . STATS_PLAYER_KILLS . '.PLAYERID ' .
			' ORDER BY AllKills';

$content['medals']['medal_custom_mp44']['DisplayName']     = 'MP44 Lover';
$content['medals']['medal_custom_mp44']['GroupedPlayerID'] = 'PLAYERID';
$content['medals']['medal_custom_mp44']['value_label']     = 'Kills';
$content['medals']['medal_custom_mp44']['description_id']  = 'medal_custom_mp44';
$content['medals']['medal_custom_mp44']['sort_id']         = 205;
$content['medals']['medal_custom_mp44']['sql']             = 'SELECT ' .
			STATS_PLAYER_KILLS . '.PLAYERID, ' .
			' sum(' . STATS_PLAYER_KILLS . '.Kills) as AllKills' .
			' FROM ' . STATS_PLAYER_KILLS .
			' INNER JOIN (' . STATS_WEAPONS . ', ' . STATS_ROUNDS .
			') ON (' .
			STATS_WEAPONS . '.ID=' . STATS_PLAYER_KILLS . '.WEAPONID AND ' .
			STATS_PLAYER_KILLS . '.ROUNDID=' . STATS_ROUNDS . '.ID ' .
			') ' .
			' WHERE ' . STATS_WEAPONS . ".INGAMENAME IN ('mp44_mp') " .
			GetCustomServerWhereQuery( STATS_PLAYER_KILLS, false, false, $serverid ) .
			GetBannedPlayerWhereQuery( STATS_PLAYER_KILLS, 'PLAYERID', false ) .
			$szTimeFilter .
			' GROUP BY ' . STATS_PLAYER_KILLS . '.PLAYERID ' .
			' ORDER BY AllKills';
