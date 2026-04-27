<?php
/*
	********************************************************************
	* Copyright by Andre Lorbach | 2006, 2007, 2008						
	* -> www.ultrastats.org <-											
	* ------------------------------------------------------------------
	*
	* Use this script at your own risk!									
	*
	* ------------------------------------------------------------------
	* ->	Helper Parser File
	*		Contains helper functions for the parser
	*																	
	* This file is part of UltraStats
	*
	* UltraStats is free software: you can redistribute it and/or modify
	* it under the terms of the GNU General Public License as published
	* by the Free Software Foundation, either version 3 of the License,
	* or (at your option) any later version.
	********************************************************************
*/


// --- Avoid directly accessing this file! 
if ( !defined('IN_ULTRASTATS') )
{
	die('Hacking attempt');
	exit;
}
// --- 

/**
 * Reset in-memory lookup caches for a full gamelog parse (GetActionIDByName, GetWeaponIDByName, etc.).
 */
function Parser_ResetLookupCaches() {
	global $parser_lookup_cache;
	$parser_lookup_cache = array(
		'gameaction'       => array(),
		'weapon'           => array(),
		'weapon_perserver' => array(),
		'damagetype'       => array(),
		'hitloc'           => array(),
	);
}

function CreateHTMLHeader()
{
	global $RUNMODE, $content, $gl_root_path;


	// not needed in console mode
	if ( $RUNMODE == RUNMODE_COMMANDLINE )
		return;

	// SSE stream: no HTML document wrapper (see PrintHTMLDebugInfo / CreateHTMLFooter).
	if ( defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE ) {
		global $currentclass, $currentmenuclass;
		$currentclass     = 'line0';
		$currentmenuclass = 'cellmenu1';
		return;
	}

	global $currentclass, $currentmenuclass;
	$currentclass = "line0";
	$currentmenuclass = "cellmenu1";

	$parserBodyStyle = ( defined( 'IS_PARSERPAGE' ) && IS_PARSERPAGE )
		? ' style="background-color:#1a1a1a;color:#e0e0e0;"'
		: '';

	print ('<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
			<html>
			<head>
			<link rel="stylesheet" href="' . $gl_root_path . 'css/defaults.css" type="text/css">
			<link rel="stylesheet" href="' . $gl_root_path . 'css/menu.css" type="text/css">
			<link rel="stylesheet" href="' . $gl_root_path . 'themes/' . $content['web_theme'] . '/main.css" type="text/css">
			</head>
			<SCRIPT language="JavaScript">
				var g_intervalID;
				function scrolldown()
				{
					scrollTo(0, 1000000);
				}
				// Always scroll down
				g_intervalID = setInterval(scrolldown, 250);
			</SCRIPT>
			<body TOPMARGIN="0" LEFTMARGIN="0" MARGINWIDTH="0" MARGINHEIGHT="0"' . $parserBodyStyle . ' OnLoad="scrolldown(); clearInterval(g_intervalID);"><br>
			');
}

function PrintDebugInfoHeader()
{
	global $RUNMODE, $gl_root_path, $LANG;
	global $currentmenuclass;

	// Include Language file as well
	IncludeLanguageFile( $gl_root_path . 'lang/' . $LANG . '/admin.php' );

	if ( $RUNMODE == RUNMODE_COMMANDLINE )
		print ( "Num.\tFacility . \tDebug Message\n" );
	else if ( $RUNMODE == RUNMODE_WEBSERVER && defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE ) {
		UltraStats_ParserSseEmitEvent(
			'table_header',
			array(
				't'   => 'header',
				'cols' => array( 'Number', 'DebugLevel', 'Facility', 'DebugMessage' ),
			)
		);
	} else if ( $RUNMODE == RUNMODE_WEBSERVER )
	{
	print('	<table width="100%" border="0" cellspacing="1" cellpadding="1" align="center" bgcolor="#777777">
			<tr> 
				<td class="' . $currentmenuclass . '" width="50" align="center" nowrap><B>Number</B></td>
				<td class="' . $currentmenuclass . '" width="100" align="center" nowrap><B>DebugLevel</B></td>
				<td class="' . $currentmenuclass . '" width="150" align="center" nowrap><B>Facility</B></td>
				<td class="' . $currentmenuclass . '" width="100%" align="center" ><B>DebugMessage</B></td>
			</tr>
			</table>');
	}
}

function PrintSecureUserCheckLegacy( $warningtext, $yesmsg, $nomsg, $operation )
{
	global $content, $myserver;

	if ( defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE && function_exists( 'UltraStats_ParserSseEmitEvent' ) ) {
		$GLOBALS['ultrastats_parser_sse_awaiting_confirm'] = true;
		$opEsc = rawurlencode( (string) $operation );
		$sid   = (int) $myserver['ID'];
		$GLOBALS['ultrastats_parser_sse_confirm_payload'] = array(
			't'             => 'confirm',
			'warning'       => $warningtext,
			'confirmUrl'    => 'parser-sse.php?op=' . $opEsc . '&id=' . $sid . '&verify=yes',
			'confirmLabel'  => $yesmsg,
			'cancelLabel'   => $nomsg,
		);
		UltraStats_ParserSseEmitEvent( 'confirm_action', $GLOBALS['ultrastats_parser_sse_confirm_payload'] );
		return;
	}

	// Show Accept FORM!
	print('<br><br>
			<table width="700" cellpadding="2" cellspacing="0" border="0" align="center" class="with_border">
			<tr>
				<td colspan="10" align="center" valign="top" class="title"><strong><FONT COLOR="red">' . $warningtext . '</FONT></strong></td>
			</tr>
			</table>
			<table width="700" cellpadding="2" cellspacing="1" border="0" align="center" class="with_border">
			<tr>
				<td align="center" class="line1">
					<br>
					<A HREF="parser-core.php?op=' . $operation . '&id=' . $myserver['ID'] . '&verify=yes">
					<img src="' . $content['BASEPATH'] . 'images/icons/check.png" width="16"><br>
					' . $yesmsg . '</A>
				</td>
				<td align="center" class="line1">
					<A HREF="javascript:history.back;">
					<br>
					<img src="' . $content['BASEPATH'] . 'images/icons/redo.png" width="16"><br>
					' . $nomsg . '</A>
				</td>
			</tr>
			</table>
			');
}

function PrintPasswordRequest()
{
	global $content, $myserver;

	if ( defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE && function_exists( 'UltraStats_ParserSseEmitEvent' ) ) {
		$GLOBALS['ultrastats_parser_sse_awaiting_password'] = true;
		$sid = (int) $myserver['ID'];
		$GLOBALS['ultrastats_parser_sse_password_payload'] = array(
			't'           => 'ftp_password',
			'message'     => isset( $content['LN_FTPLOGINFAILED'] ) ? $content['LN_FTPLOGINFAILED'] : 'FTP login failed.',
			'hint'        => 'The embedded parser cannot submit a password form. Open the classic parser page to enter your FTP password.',
			'linkLabel'   => isset( $content['LN_ADMINGETNEWLOG'] ) ? $content['LN_ADMINGETNEWLOG'] : 'Get New Logfile',
			'serverId'    => $sid,
			'classicUrl'  => 'parser-core.php?op=getnewlogfile&id=' . $sid,
		);
		UltraStats_ParserSseEmitEvent( 'password_prompt', $GLOBALS['ultrastats_parser_sse_password_payload'] );
		return;
	}

	// Show Accept FORM!
	print('<br><br>
			<form action="parser-core.php?op=getnewlogfile&id=' . $myserver['ID'] . '" method="post">
			<table width="400" cellpadding="2" cellspacing="0" border="0" align="center" class="with_border">
			<tr>
				<td colspan="10" align="center" valign="top" class="title"><strong><FONT COLOR="red">' . $content['LN_FTPLOGINFAILED'] . '</FONT></strong></td>
			</tr>
			</table>
			<table width="400" cellpadding="2" cellspacing="1" border="0" align="center" class="with_border">
			<tr>
				<td align="left" class="cellmenu1" width="150" nowrap><b>' . $content['LN_FTPPASSWORD'] . '</b></td>
				<td align="right" class="line0" width="100%"><input type="password" name="pwd" size="32" maxlength="255" value=""></td>
			</tr>
			<tr>
				<td align="center" colspan="2">
					<input type="submit" value="' . $content['LN_ADMINSEND'] . '">
				</td>
			</tr>
			</table>
			</form>
			');
}

function PrintHTMLDebugInfo( $facility, $fromwhere, $szDbgInfo )
{
	global $content, $currentclass, $currentmenuclass, $gldbgcounter, $DEBUGMODE, $RUNMODE;

	// No output in this case
	if ( $facility > $DEBUGMODE )
		return;

	if ( !isset($gldbgcounter) )
		$gldbgcounter = 0;
	$gldbgcounter++;

	if ( $RUNMODE == RUNMODE_COMMANDLINE )
		print ( $gldbgcounter . ". \t" . GetFacilityAsString($facility) . ". \t" . $fromwhere . ". \t" . $szDbgInfo . "\n" );
	else if ( $RUNMODE == RUNMODE_WEBSERVER && defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE )
	{
		$line = array(
			't'     => 'log',
			'n'     => (int) $gldbgcounter,
			'lvl'   => GetFacilityAsString( $facility ),
			'fac'   => $fromwhere,
			'msg'   => $szDbgInfo,
			'fc'    => GetDebugClassFacilityAsString( $facility ),
			'lc'    => $currentclass,
			'mc'    => $currentmenuclass,
		);
		UltraStats_ParserSseEmitEvent( 'message', $line );

		if ( $currentclass == 'line0' ) {
			$currentclass = 'line1';
		} else {
			$currentclass = 'line0';
		}
		if ( $currentmenuclass == 'cellmenu1' ) {
			$currentmenuclass = 'cellmenu2';
		} else {
			$currentmenuclass = 'cellmenu1';
		}
	}
	else if ( $RUNMODE == RUNMODE_WEBSERVER )
	{
		print ('<table width="100%" border="0" cellspacing="1" cellpadding="1" align="center" bgcolor="#777777">
				<tr> 
					<td class="' . $currentmenuclass . '" width="50" align="center" nowrap><B>' . $gldbgcounter . '</B></td>
					<td class="' . GetDebugClassFacilityAsString($facility) . '" width="100" align="center" nowrap><B>' . GetFacilityAsString($facility) . '</B></td>
					<td class="' . $currentclass . '" width="150" align="center" nowrap><B>' . $fromwhere . '</B></td>
					<td class="' . $currentclass . '" width="100%">&nbsp;&nbsp;' . $szDbgInfo . '</td>
				</tr>
				</table>');

		// Set StyleSheetclasses
		if ( $currentclass == "line0" )
			$currentclass = "line1";
		else
			$currentclass = "line0";
		if ( $currentmenuclass == "cellmenu1" )
			$currentmenuclass = "cellmenu2";
		else
			$currentmenuclass = "cellmenu1";
	}

	//Flush output
	FlushParserOutput();

	// If DEBUG_ERROR_WTF and $content['gen_phpdebug'] is set, abort!
	if ( $content['gen_phpdebug'] == 1 && $facility == DEBUG_ERROR_WTF ) {
		if ( defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE ) {
			UltraStats_ParserSseEmitEvent( 'parser_error', array( 'message' => $szDbgInfo ) );
		}
		die ( $szDbgInfo );
	}
}

function FlushParserOutput()
{
	global $RUNMODE;
	
	// not needed in console mode
	if ( $RUNMODE == RUNMODE_COMMANDLINE )
		return;

	//Flush php output
	if ( defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE && function_exists( 'UltraStats_FlushSse' ) ) {
		UltraStats_FlushSse();
		return;
	}
	@flush();
	@ob_flush();
}

function GetFacilityAsString( $facility )
{
	switch ( $facility )
	{
		case DEBUG_ULTRADEBUG:
			return STR_DEBUG_ULTRADEBUG;
		case DEBUG_DEBUG:
			return STR_DEBUG_DEBUG;
		case DEBUG_INFO:
			return STR_DEBUG_INFO;
		case DEBUG_WARN:
			return STR_DEBUG_WARN;
		case DEBUG_ERROR:
			return STR_DEBUG_ERROR;
		case DEBUG_ERROR_WTF:
			return STR_DEBUG_ERROR_WTF;
	}
	
	// reach here = unknown
	return "*Unknown*";
}

function GetDebugClassFacilityAsString( $facility )
{
	switch ( $facility )
	{
		case DEBUG_ULTRADEBUG:
			return "debugultradebug";
		case DEBUG_DEBUG:
			return "debugdebug";
		case DEBUG_INFO:
			return "debuginfo";
		case DEBUG_WARN:
			return "debugwarn";
		case DEBUG_ERROR:
			return "debugerror";
		case DEBUG_ERROR_WTF:
			return "debugerrorwtf";
	}
	
	// reach here = unknown
	return "*Unknown*";
}

function CreateHTMLFooter()
{
	global $content, $ParserStart, $RUNMODE;
	$RenderTime = number_format( microtime_float() - $ParserStart, 4, '.', '');
	
	// not needed in console mode
	if ( $RUNMODE == RUNMODE_COMMANDLINE )
		return;

	if ( defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE ) {
		$donePayload = array(
			't'            => 'done',
			'seconds'      => $RenderTime,
			'parserStart'  => isset( $ParserStart ) ? $ParserStart : 0,
		);
		if ( ! empty( $GLOBALS['ultrastats_parser_sse_awaiting_confirm'] ) ) {
			$donePayload['awaitingConfirm'] = true;
			if ( ! empty( $GLOBALS['ultrastats_parser_sse_confirm_payload'] ) && is_array( $GLOBALS['ultrastats_parser_sse_confirm_payload'] ) ) {
				$donePayload['confirm'] = $GLOBALS['ultrastats_parser_sse_confirm_payload'];
			}
			unset( $GLOBALS['ultrastats_parser_sse_awaiting_confirm'], $GLOBALS['ultrastats_parser_sse_confirm_payload'] );
		} elseif ( ! empty( $GLOBALS['ultrastats_parser_sse_awaiting_password'] ) ) {
			$donePayload['awaitingPassword'] = true;
			if ( ! empty( $GLOBALS['ultrastats_parser_sse_password_payload'] ) && is_array( $GLOBALS['ultrastats_parser_sse_password_payload'] ) ) {
				$donePayload['passwordForm'] = $GLOBALS['ultrastats_parser_sse_password_payload'];
			}
			unset( $GLOBALS['ultrastats_parser_sse_awaiting_password'], $GLOBALS['ultrastats_parser_sse_password_payload'] );
		}
		UltraStats_ParserSseEmitEvent( 'done', $donePayload );
		return;
	}

	print ('<br><center><h3>Finished</h3>
			Total running time was ' . $RenderTime . ' seconds
			<br><br>
			<br>
			</center>
			</body> 
			</html>');
}

function GetLastPlayedSeconds( $serverid )
{
	// --- Get last FilePosition
	$result = DB_Query("SELECT PlayedSeconds FROM " . STATS_SERVERS . " WHERE id = $serverid");
	$rows = DB_GetAllRows($result, true);
	if ( ! empty( $rows ) )
		return $rows[0]['PlayedSeconds'];
	else
		return 0;
}

function GetLastLogLine( $serverid )
{
	// --- Get last FilePosition
	$result = DB_Query("SELECT LastLogLine FROM " . STATS_SERVERS . " WHERE id = $serverid");
	$rows = DB_GetAllRows($result, true);
	if ( ! empty( $rows ) )
		return $rows[0]['LastLogLine'];
	else
		return 0;
}

function SetLastLogLine( $serverid, $newlastline, $nTotalPlayedSeconds )
{
	global $content;

	// If disabled we skip this part
	if ( $content['parser_disablelastline'] == "yes" ) 
		return;

	// --- Set the last FilePosition
	$result = DB_Query("UPDATE " . STATS_SERVERS . " SET LastLogLine = " . $newlastline . ", PlayedSeconds = " . $nTotalPlayedSeconds . " WHERE ID = $serverid");
	DB_FreeQuery($result);
}

function GetSecondsFromLogLine( $logline )
{
	$tempstr = explode(" ", trim($logline));
	$timestr = explode(":", trim($tempstr[0]));
	
	if ( !isset($timestr[1]) )
	{
		PrintHTMLDebugInfo( DEBUG_ERROR_WTF, "GetSecondsFromLogLine", "Invalid LOGLINE detected: '" . $logline . "'");
		return -1;
	}

	// We only need to add them
	return ( (intval($timestr[0])*60) + intval($timestr[1]) );
}

function CheckLogLine($myLine)
{
	// First of all trim
	$myReturnLine = trim($myLine);

	// --- New check if space is missing between timestamp and rest
	$myTempArray	= explode(" ", $myReturnLine);

	if ( count($myTempArray) < 2 )
		return false;

	if ( strstr($myTempArray[0], ':') == FALSE )
		return false;

	// ---
	return true;
}

function SplitTimeFromLogLine($myLogLine)
{
	// Return the Raw Logline
	return trim( strstr( trim($myLogLine), ' ') );
}

function GetMapIDByName( $mapname )
{
	$result = DB_Query("SELECT ID FROM " . STATS_MAPS . " WHERE MAPNAME = '$mapname'");
	$myrow = DB_GetSingleRow($result, true);
	if ( isset($myrow['ID']) )
		return $myrow['ID'];
	else
		return ProcessInsertStatement( "INSERT INTO " . STATS_MAPS . " (MAPNAME, Description_id) VALUES ('$mapname', '" . $mapname . "_description')");
}

function GetGameTypeByName( $gametype )
{
	$result = DB_Query("SELECT ID FROM " . STATS_GAMETYPES . " WHERE NAME = '$gametype'");
	$myrow = DB_GetSingleRow($result, true);
	if ( isset($myrow['ID']) )
		return $myrow['ID'];
	else
		return ProcessInsertStatement( "INSERT INTO " . STATS_GAMETYPES . " (NAME, Description_id) VALUES ('$gametype', 'gametype_" . $gametype . "')");
}

function GetDamageTypeIDByName( $damagetype )
{
	global $parser_lookup_cache;
	if ( ! isset( $parser_lookup_cache ) ) {
		Parser_ResetLookupCaches();
	}
	if ( isset( $parser_lookup_cache['damagetype'][ $damagetype ] ) ) {
		return $parser_lookup_cache['damagetype'][ $damagetype ];
	}
	$result = DB_Query("SELECT ID FROM " . STATS_DAMAGETYPES . " WHERE DAMAGETYPE = '$damagetype'");
	$myrow = DB_GetSingleRow($result, true);
	if ( isset($myrow['ID']) ) {
		$parser_lookup_cache['damagetype'][ $damagetype ] = (int) $myrow['ID'];
		return $parser_lookup_cache['damagetype'][ $damagetype ];
	}
	PrintHTMLDebugInfo( DEBUG_ERROR_WTF, "GetDamageTypeIDByName", "Unknown DamageType detected: '" . $damagetype . "'");
	$id = ProcessInsertStatement( "INSERT INTO " . STATS_DAMAGETYPES . " (DAMAGETYPE, DisplayName) VALUES ('" . $damagetype . "', '" . $damagetype . "')");
	$parser_lookup_cache['damagetype'][ $damagetype ] = (int) $id;
	return (int) $id;
}

function GetWeaponIDByName( $weaponname )
{
	global $myserver, $parser_lookup_cache;
	if ( ! isset( $parser_lookup_cache ) ) {
		Parser_ResetLookupCaches();
	}

	// Move GL at the right position, to avoid duplicated weapon ID's!
	$pos = strpos($weaponname, "gl_");
	if ( $pos !== false && $pos == 0) 
	{	
		// store for debug
		$oldname = $weaponname;

		// Remove GL first!
		$weaponname = str_replace("gl_", "", $weaponname);

		// Add gl_ where it belongs to!
		$weaponname = str_replace("_mp", "_gl_mp", $weaponname);

		PrintHTMLDebugInfo( DEBUG_ULTRADEBUG, "GetWeaponIDByName", "Renamed weapon '" . $oldname . "' into '" . $weaponname . "'!");

	}

	/* --- Hotfix for crap cod4 logging format .. damn dev noobs @iw ... 
	*	Rewritting the weapon_ids of these here: 
		gl_ak47_mp
		gl_g36c_mp
		gl_g3_mp
		gl_m14_mp
		gl_m16_mp
		gl_m4_mp
	--- 
	$search = array( "gl_ak47_mp", "gl_g36c_mp", "gl_g3_mp", "gl_m14_mp", "gl_m16_mp", "gl_m4_mp" );
	$replace = array( "ak47_gl_mp", "g36c_gl_mp", "g3_gl_mp", "m14_gl_mp", "m16_gl_mp", "m4_gl_mp" );
	$weaponname = str_replace($search, $replace, $weaponname);
	*/

	$key = $weaponname;
	if ( isset( $parser_lookup_cache['weapon'][ $key ] ) ) {
		$weaponid = $parser_lookup_cache['weapon'][ $key ];
	} else {
		$result = DB_Query("SELECT ID FROM " . STATS_WEAPONS . " WHERE INGAMENAME = '$weaponname'");
		$myrow = DB_GetSingleRow($result, true);
		if ( isset($myrow['ID']) ) {
			$weaponid = (int) $myrow['ID'];
		} else {
			$weaponid = (int) ProcessInsertStatement( "INSERT INTO " . STATS_WEAPONS . " (INGAMENAME, Description_id) VALUES ('$weaponname', 'weapon_" . $weaponname . "')");
		}
		$parser_lookup_cache['weapon'][ $key ] = $weaponid;
	}

	$psKey = (int) $myserver['ID'] . ':' . $weaponid;
	if ( empty( $parser_lookup_cache['weapon_perserver'][ $psKey ] ) ) {
		$result = DB_Query("SELECT SERVERID FROM " . STATS_WEAPONS_PERSERVER . " WHERE WEAPONID = " . $weaponid . " AND SERVERID = " . $myserver['ID']);
		$myrow = DB_GetSingleRow($result, true);
		if ( ! isset( $myrow['SERVERID'] ) ) {
			ProcessInsertStatement( "INSERT INTO " . STATS_WEAPONS_PERSERVER . " (WEAPONID, SERVERID, ENABLED) VALUES (" . $weaponid . ", " . $myserver['ID'] . ", 1)");
		}
		$parser_lookup_cache['weapon_perserver'][ $psKey ] = 1;
	}

	return $weaponid;
}

function GetActionIDByName( $actionname )
{
	global $parser_lookup_cache;
	if ( ! isset( $parser_lookup_cache ) ) {
		Parser_ResetLookupCaches();
	}
	if ( isset( $parser_lookup_cache['gameaction'][ $actionname ] ) ) {
		return $parser_lookup_cache['gameaction'][ $actionname ];
	}
	$result = DB_Query("SELECT ID FROM " . STATS_GAMEACTIONS . " WHERE NAME = '$actionname'");
	$myrow = DB_GetSingleRow($result, true);
	if ( isset($myrow['ID']) ) {
		$parser_lookup_cache['gameaction'][ $actionname ] = (int) $myrow['ID'];
		return $parser_lookup_cache['gameaction'][ $actionname ];
	}
	$id = ProcessInsertStatement( "INSERT INTO " . STATS_GAMEACTIONS . " (NAME) VALUES ('$actionname')");
	$parser_lookup_cache['gameaction'][ $actionname ] = (int) $id;
	return (int) $id;
}

function GetGametypeFromInitGame($mybuffer)
{
	// +11 Chars to remove the "InitGame: \" and Create tmp Servervar Array
	$tmparray = explode( "\\", trim(substr( SplitTimeFromLogLine($mybuffer), 11)) );
	for($i = 0; $i < count($tmparray); $i+=2)
		$cvartmparray[ DB_RemoveBadChars($tmparray[$i]) ] = DB_RemoveBadChars( $tmparray[$i+1] );

	if ( isset($cvartmparray['g_gametype']) )
		return $cvartmparray['g_gametype'];
	else
	{
		PrintHTMLDebugInfo( DEBUG_ERROR_WTF, "GetGametypeFromInitGame", "Unknown GameInit detected: '" . print_r($cvartmparray) . "'");
		return "";
	}
}

function GetHitLocationTypeIDByName( $hitloaction )
{
	global $parser_lookup_cache;
	if ( ! isset( $parser_lookup_cache ) ) {
		Parser_ResetLookupCaches();
	}
	if ( isset( $parser_lookup_cache['hitloc'][ $hitloaction ] ) ) {
		return $parser_lookup_cache['hitloc'][ $hitloaction ];
	}
	$result = DB_Query("SELECT ID FROM " . STATS_HITLOCATIONS . " WHERE BODYPART = '$hitloaction'");
	$rows = DB_GetAllRows($result, true);
	if ( ! empty( $rows ) ) {
		$parser_lookup_cache['hitloc'][ $hitloaction ] = (int) $rows[0]['ID'];
		return $parser_lookup_cache['hitloc'][ $hitloaction ];
	}
	PrintHTMLDebugInfo( DEBUG_ERROR_WTF, "GetHitLocationTypeIDByName", "Unknown HitLocation detected: '" . $hitloaction . "'");
	$id = ProcessInsertStatement( "INSERT INTO " . STATS_HITLOCATIONS . " (BODYPART, DisplayName) VALUES ('" . $hitloaction . "', '" . $hitloaction . "')");
	$parser_lookup_cache['hitloc'][ $hitloaction ] = (int) $id;
	return (int) $id;
}

function ProcessSelectStatement( $sqlStatement )
{
	global $SQL_SELECT_Count;

	// RUN DB Query
	$result = DB_Query( $sqlStatement );
	
	// Increment counter
	$SQL_SELECT_Count++;

	return $result;
}

function ProcessExtendedInsertStatement( $sqlStatement, $nStatementCount, $execDirect = true)
{
	global $SQL_INSERT_Count;

	$result = DB_Query( $sqlStatement );
	if ($result == FALSE)
	{
		PrintHTMLDebugInfo( DEBUG_ERROR, "ProcessInsertStatement", "INSERT Statement Error: ".$sqlStatement);
		return -1;
	}
	else
		PrintHTMLDebugInfo( DEBUG_ULTRADEBUG, "ProcessInsertStatement", "INSERT Statement Success: ".$sqlStatement);
		
	// Increment counter
	$SQL_INSERT_Count += $nStatementCount;

	// Get ID and free result
	global $link_id;
	$InsertID = mysqli_insert_id( $link_id );
	DB_FreeQuery($result);

	//Return ID
	return $InsertID;
}

function ProcessInsertStatement( $sqlStatement, $execDirect = true)
{
	global $SQL_INSERT_Count;

	$result = DB_Query( $sqlStatement );
	if ($result == FALSE)
	{
		PrintHTMLDebugInfo( DEBUG_ERROR, "ProcessInsertStatement", "INSERT Statement Error: ".$sqlStatement);
		return -1;
	}
	else
		PrintHTMLDebugInfo( DEBUG_ULTRADEBUG, "ProcessInsertStatement", "INSERT Statement Success: ".$sqlStatement);
		
	// Increment counter
	$SQL_INSERT_Count++;

	// Get ID and free result
	global $link_id;
	$InsertID = mysqli_insert_id( $link_id );
	DB_FreeQuery($result);

	//Return ID
	return $InsertID;
}

function ProcessDeleteStatement( $sqlStatement )
{
	$result = DB_Query( $sqlStatement );
	if ($result == FALSE)
	{
		PrintHTMLDebugInfo( DEBUG_ERROR, "ProcessDeleteStatement", "DELETE Statement Error: ".$sqlStatement);
		return false;
	}
	else
		PrintHTMLDebugInfo( DEBUG_ULTRADEBUG, "ProcessDeleteStatement", "DELETE Statement Success: ".$sqlStatement);
	DB_FreeQuery($result);

	// Done
	return true;
}

function ProcessUpdateStatement( $sqlStatement, $execDirect = false )
{
	global $content, $SQL_UDPATE_Direct_Count, $SQL_UDPATE_Batch_Count, $sqlupdatestatements;

	if ( $execDirect || $content['MYSQL_BULK_MODE'] == false ) 
	{	// Only DIRECT Update Mode atm!
		$result = DB_Query( $sqlStatement );
		if ($result == FALSE)
		{
			PrintHTMLDebugInfo( DEBUG_ERROR, "ProcessUpdateStatement", "UPDATE Statement Error: ".$sqlStatement);
			return false;
		}
		else
			PrintHTMLDebugInfo( DEBUG_ULTRADEBUG, "ProcessUpdateStatement", "UPDATE Statement Success: ".$sqlStatement);
		
		// Increment counter
		$SQL_UDPATE_Direct_Count++;

		// Free result
		DB_FreeQuery($result);
	}
	else
	{
		$sqlupdatestatements .= $sqlStatement . ";\r\n";

		// Increment counter
		$SQL_UDPATE_Batch_Count++;
	}
}

/**
 * Flush batched UPDATE strings using mysqli_multi_query when possible; fall back to mysql CLI.
 *
 * @return bool True when mysqli_multi_query handled the full queue; false when CLI was used or empty.
 */
function ProcessQueuedUpdateStatement()
{
	global $content, $CFG, $link_id, $sqlupdatestatements;

	if ( ! isset( $sqlupdatestatements ) || strlen( (string) $sqlupdatestatements ) === 0 ) {
		return true;
	}

	$raw = trim( (string) $sqlupdatestatements );
	$bits     = preg_split( '/;\s*\R+/u', $raw );
	$stmts    = array();
	foreach ( $bits as $b ) {
		$b = trim( $b );
		if ( $b !== '' ) {
			$stmts[] = $b . ';';
		}
	}

	if ( empty( $stmts ) ) {
		$sqlupdatestatements = '';
		return true;
	}

	$joined    = implode( '', $stmts );
	$maxMulti  = 16777216;

	if ( strlen( $joined ) <= $maxMulti && function_exists( 'mysqli_multi_query' ) && $link_id instanceof mysqli ) {
		if ( UltraStats_FlushMultiQueryBatch( $joined ) ) {
			$sqlupdatestatements = '';
			PrintHTMLDebugInfo( DEBUG_DEBUG, 'QueuedUpdates', 'Flushed ' . count( $stmts ) . ' queued UPDATE(s) via mysqli_multi_query.' );
			return true;
		}
		PrintHTMLDebugInfo( DEBUG_WARN, 'QueuedUpdates', 'mysqli_multi_query failed; falling back to mysql CLI.' );
	} elseif ( strlen( $joined ) > $maxMulti ) {
		PrintHTMLDebugInfo( DEBUG_DEBUG, 'QueuedUpdates', 'Queued UPDATE batch exceeds mysqli size limit; using mysql CLI.' );
	}

	$dump = implode( "\r\n", $stmts );
	$myhandle = @fopen( $content['sqltmpfile'], 'w' );
	if ( $myhandle ) {
		fwrite( $myhandle, $dump . "\r\n" );
		fclose( $myhandle );
	}

	$hasPass = isset( $CFG['Pass'] ) && strlen( (string) $CFG['Pass'] ) > 0;
	if ( $hasPass ) {
		$myCommand = $content['MYSQLPATH'] . ' -u ' . $CFG['User'] . ' -p' . $CFG['Pass'] . ' ' . $CFG['DBName'] . ' < ' . $content['sqltmpfile'];
	} else {
		$myCommand = $content['MYSQLPATH'] . ' -u ' . $CFG['User'] . ' ' . $CFG['DBName'] . ' < ' . $content['sqltmpfile'];
	}

	$myOutput = shell_exec( $myCommand );
	if ( is_string( $myOutput ) && strlen( $myOutput ) > 0 ) {
		PrintHTMLDebugInfo( DEBUG_WARN, 'QueuedUpdates', 'MySQL Pipe Output: ' . $myOutput );
	} else {
		PrintHTMLDebugInfo( DEBUG_DEBUG, 'QueuedUpdates', 'MySQL CLI: ' . $myCommand );
	}

	$sqlupdatestatements = '';
	return false;
}

/**
 * @param string $sql One or more semicolon-terminated statements.
 */
function UltraStats_FlushMultiQueryBatch( $sql ) {
	global $link_id;
	if ( ! $link_id instanceof mysqli || $sql === '' ) {
		return false;
	}
	try {
		if ( ! mysqli_multi_query( $link_id, $sql ) ) {
			return false;
		}
		do {
			$res = mysqli_store_result( $link_id );
			if ( $res instanceof mysqli_result ) {
				mysqli_free_result( $res );
			}
		} while ( mysqli_more_results( $link_id ) && mysqli_next_result( $link_id ) );

		return mysqli_errno( $link_id ) === 0;
	} catch ( Throwable $e ) {
		return false;
	}
}

function GetPlayerWithMostKills()
{
	global $myPlayers;
	
	if ( isset($myPlayers) && count($myPlayers) > 0 )
	{
		$highestkill = 0;
		$returnguid = "";

		// Search for the Player with most kills
		foreach ( $myPlayers as $player )
		{
			if ( $player[PLAYER_KILLS] > $highestkill )
			{
				$highestkill = $player[PLAYER_KILLS];
				$returnguid = $player[PLAYER_GUID];
			}
		}

		// Return best player
		return $returnguid;
	}
	else
		return "";
}

/*	Helper function which will generate stripped Aliases Names 
*	for all existing an new Alias Entries. Only empty ones will 
*	be generated and updates
*/
function GenerateStrippedCodeAliases()
{
	global $content;

	$sqlquery = "SELECT " .
				STATS_ALIASES . ".ID, " . 
				STATS_ALIASES . ".Alias " . 
				" FROM " . STATS_ALIASES . 
				" WHERE AliasStrippedCodes = '' ";
	$result = DB_Query( $sqlquery );
	$allaliases = DB_GetAllRows($result, true);
	if ( ! empty( $allaliases ) )
	{
		PrintHTMLDebugInfo( DEBUG_INFO, "GenerateStrippedCodeAliases", "Starting Stripped Alias Calculation for '" . count($allaliases) . "' Aliases ...");
		for($i = 0; $i < count($allaliases); $i++)
		{
			$strippedalias = DB_RemoveBadChars( StripColorCodesFromString( $allaliases[$i]['Alias'] ) );
			if ( strlen($strippedalias) <= 0 )	// matches for peoples using colorcodes only, bastards :D
				$strippedalias = "Undefined";

			ProcessUpdateStatement(	" UPDATE " . STATS_ALIASES . " SET " . 
									" AliasStrippedCodes = '" . $strippedalias . "'" . 
									" WHERE ID = " . $allaliases[$i]['ID'] );
		}
	}
}

function ReCreateAliases()
{
	global $content;

	PrintHTMLDebugInfo( DEBUG_INFO, "ReCreateAliases", "Starting Total Aliases HTML Code Calculation ...");

	$sqlquery = "SELECT " .
						STATS_ALIASES . ".ID,  " . 
						STATS_ALIASES . ".Alias " . 
						" FROM " . STATS_ALIASES;
	$result = DB_Query( $sqlquery );
	$allplayers = DB_GetAllRows($result, true);
	if ( ! empty( $allplayers ) )
	{
		for($i = 0; $i < count($allplayers); $i++)
		{
			// Create WHERE
			$wherequery = " WHERE " . STATS_ALIASES . ".ID = " . $allplayers[$i]['ID'];

			// First of all we need to clean up the mess!
			$searchfor = array( "amp;", "&lt;", "&gt;" );
			$replacewith = array( "", "<", ">" );
			$allplayers[$i]['Alias'] = str_replace ( $searchfor, $replacewith, $allplayers[$i]['Alias'] );
			
			// Now create plain alias code!
			$plainalias = GetPlayerNameAsWithHTMLCodes( DB_RemoveBadChars($allplayers[$i]['Alias']) );
			$aliaschecksum = sprintf( "%u", crc32 ( $plainalias )); 
			$aliasashtml = GetPlayerNameAsHTML( DB_RemoveBadChars($allplayers[$i]['Alias']) );
			$strippedalias = StripColorCodesFromString( DB_RemoveBadChars($allplayers[$i]['Alias']) );
			if ( strlen($strippedalias) <= 0 )	// matches for peoples using colorcodes only, bastards :D
				$strippedalias = "ColorCodePlayer";

			// Update Calc
			ProcessUpdateStatement("UPDATE " . STATS_ALIASES . " SET Alias = '" . $plainalias .  "', AliasChecksum = " . $aliaschecksum . ", AliasAsHtml = '" . $aliasashtml . "', AliasStrippedCodes = '" . $strippedalias . "' " . $wherequery );
		}
	}
}

function CreateTopAliases( $serverid )
{
	global $content;

	if ( $serverid != -1 ) {
		PrintHTMLDebugInfo( DEBUG_INFO, "CreateTopAliases", "Starting TopAliases Calculation ..." );
		$sid = (int) $serverid;
		ProcessDeleteStatement( "DELETE FROM " . STATS_PLAYERS_TOPALIASES . " WHERE SERVERID = " . $sid );
		$sql = "INSERT INTO " . STATS_PLAYERS_TOPALIASES . " (GUID, SERVERID, ALIASID) " .
			"WITH alias_sums AS ( " .
			"  SELECT PLAYERID, SERVERID, `Alias`, SUM(`Count`) AS MyCount, MAX(ID) AS AliasRowId " .
			"  FROM " . STATS_ALIASES . " WHERE SERVERID = " . $sid . " " .
			"  GROUP BY PLAYERID, SERVERID, `Alias` " .
			"), ranked AS ( " .
			"  SELECT PLAYERID AS GUID, SERVERID, AliasRowId AS ALIASID, " .
			"    ROW_NUMBER() OVER (PARTITION BY PLAYERID, SERVERID ORDER BY MyCount DESC, AliasRowId DESC) AS rn " .
			"  FROM alias_sums " .
			") " .
			"SELECT r.GUID, r.SERVERID, r.ALIASID " .
			"FROM ranked r " .
			"INNER JOIN ( SELECT GUID FROM " . STATS_PLAYERS . " WHERE SERVERID = " . $sid . " GROUP BY GUID ) p ON p.GUID = r.GUID " .
			"WHERE r.rn = 1";
		$res = DB_Query( $sql );
		if ( $res === false ) {
			PrintHTMLDebugInfo( DEBUG_ERROR, "CreateTopAliases", "Bulk top-alias insert failed for SERVERID " . $sid );
		} else {
			DB_FreeQuery( $res );
		}
		return;
	}

	PrintHTMLDebugInfo( DEBUG_INFO, "CreateTopAliases", "Starting Total TopAliases Calculation ..." );
	$globalSid = (int) $serverid;
	ProcessDeleteStatement( "DELETE FROM " . STATS_PLAYERS_TOPALIASES . " WHERE SERVERID = " . $globalSid );
	$sql = "INSERT INTO " . STATS_PLAYERS_TOPALIASES . " (GUID, SERVERID, ALIASID) " .
		"WITH alias_sums AS ( " .
		"  SELECT PLAYERID, `Alias`, SUM(`Count`) AS MyCount, MAX(ID) AS AliasRowId " .
		"  FROM " . STATS_ALIASES . " " .
		"  GROUP BY PLAYERID, `Alias` " .
		"), ranked AS ( " .
		"  SELECT PLAYERID AS GUID, AliasRowId AS ALIASID, " .
		"    ROW_NUMBER() OVER (PARTITION BY PLAYERID ORDER BY MyCount DESC, AliasRowId DESC) AS rn " .
		"  FROM alias_sums " .
		") " .
		"SELECT r.GUID, " . $globalSid . ", r.ALIASID " .
		"FROM ranked r " .
		"INNER JOIN ( SELECT GUID FROM " . STATS_PLAYERS . " GROUP BY GUID ) p ON p.GUID = r.GUID " .
		"WHERE r.rn = 1";
	$res = DB_Query( $sql );
	if ( $res === false ) {
		PrintHTMLDebugInfo( DEBUG_ERROR, "CreateTopAliases", "Bulk top-alias insert failed for global SERVERID " . $globalSid );
	} else {
		DB_FreeQuery( $res );
	}
}

function SetMaxExecutionTime()
{
	global $RUNMODE, $MaxExecutionTime;

	if ($RUNMODE == RUNMODE_WEBSERVER)
	{
		// Max Execution time
// NOT NEEDED ANYMORE!
// Extend Execution Time
//		@set_time_limit( 120 );									
		$MaxExecutionTime = ini_get("max_execution_time") - 10; // Raised limit to -15 Seconds to be on the save side
		PrintHTMLDebugInfo( DEBUG_ULTRADEBUG, "Gamelog", "MaxExecutionTime = $MaxExecutionTime");
	}
	else
	{
		// Unlimited
		set_time_limit( 0 );
		PrintHTMLDebugInfo( DEBUG_ULTRADEBUG, "Gamelog", "Console Mode, unlimited Execution TIME ");
	}
}

function ParsePlayerGuid( $myArray, $arraynum, $arraynum_playername )
{
	// TODO | ADD Support for GUID by IP and NAME!
	global $content;

	if ( $content['gen_parseby'] == PARSEBY_GUIDS )
	{
		if (	$content['gen_gameversion'] == COD4 ||
				$content['gen_gameversion'] == CODWW )
		{
			// Calc Guid!
			$checksum = sprintf( "%u", crc32 ( $myArray[$arraynum] ));
			return $checksum;
		}
		else
			// Kindly return GUID
			return $myArray[$arraynum];
	}
	else // if ( $content['gen_parseby'] == PARSEBY_PLAYERNAME )
	{
		$checksum = sprintf( "%u", crc32 ( $myArray[$arraynum_playername] ));
		return $checksum;
	}
}

function GetGuidsFromPlayerArray( $szTeamName ) 
{
	global $myPlayers;
	$strGuids = "";

	foreach ( $myPlayers as $player )
	{
		if ( $player[PLAYER_TEAM] == $szTeamName )
		{
			if ( strlen($strGuids) > 0 ) 
				$strGuids .= ";";
			if ( isset($player[PLAYER_GUID]) )
				$strGuids .= $player[PLAYER_GUID];
			else
				PrintHTMLDebugInfo( DEBUG_ERROR, "GetGuidsFromPlayerArray", "Invalid Player! Array='" . implode(",", $player) . "'");
		}
	}
	
	// Debug ^^!
	PrintHTMLDebugInfo( DEBUG_DEBUG, "GetGuidsFromPlayerArray", "Found guids='" . $strGuids . "' for team '" . $szTeamName . "'");

	if ( strlen($strGuids) <= 0 )
	{
		$strdebug = "";
		foreach ( $myPlayers as $player )
		{
			if ( isset($player) )
				$strdebug .= "Player: \"" . implode(",", $player) . "\"";
		}

		PrintHTMLDebugInfo( DEBUG_DEBUG, "GetGuidsFromPlayerArray", "Empty Guids? Team = '" . $szTeamName . "' myPlayers Array='" . $strdebug . "'");
	}

	// return guids
	return $strGuids;
}

/* Converted the Timemod from ramirez into UltraStats, thanks for your original Idea and Input :) 
*	This is a helper function to obtain the StartTime from the InitGame Logline, if there is one! Otherwise the old flawed time method is used. 
*	In order to get this to work, you need this in the Startup of the Server: 
*		 +sets gamestartup \"`date +"%D %T"`\"
*/
function GetCustomServerStartTime($mybuffer)
{
	// +11 Chars to remove the "InitGame: \" and Create tmp Servervar Array
	$tmparray = explode( "\\", trim(substr( SplitTimeFromLogLine($mybuffer), 11)) );
	for($i = 0; $i < count($tmparray); $i+=2)
		$cvartmparray[ DB_RemoveBadChars($tmparray[$i]) ] = DB_RemoveBadChars( $tmparray[$i+1] );

	if ( isset($cvartmparray['gamestartup']) )
	{
		PrintHTMLDebugInfo( DEBUG_ULTRADEBUG, "GetCustomServerStartTime", "Found custom server startup time: " . $cvartmparray['gamestartup'] );
		return $cvartmparray['gamestartup'];
	}
	else
		return "";
}

// --- Cooperative "cancel" for embedded web parse (file flag; avoids session lock on parallel request)
function UltraStats_ParserCancelFlagPath( $serverId ) {
	global $content;
	$base = isset( $content['BASEPATH'] ) ? $content['BASEPATH'] : '';
	if ( $base === '' ) {
		return '';
	}
	return rtrim( $base, "/\\" ) . DIRECTORY_SEPARATOR . 'tmp' . DIRECTORY_SEPARATOR . 'parser_cancel_' . (int) $serverId . '.flag';
}

function UltraStats_ParserCancelEnsureTmp() {
	global $content;
	$base = isset( $content['BASEPATH'] ) ? $content['BASEPATH'] : '';
	if ( $base === '' ) {
		return false;
	}
	$d = rtrim( $base, "/\\" ) . DIRECTORY_SEPARATOR . 'tmp';
	if ( is_dir( $d ) ) {
		return true;
	}
	return @mkdir( $d, 0775, true );
}

function UltraStats_ParserCancelClear( $serverId ) {
	$p = UltraStats_ParserCancelFlagPath( $serverId );
	if ( $p !== '' && is_file( $p ) ) {
		@unlink( $p );
	}
}

function UltraStats_ParserCancelRequest( $serverId ) {
	if ( ! UltraStats_ParserCancelEnsureTmp() ) {
		return false;
	}
	$p = UltraStats_ParserCancelFlagPath( $serverId );
	if ( $p === '' ) {
		return false;
	}
	return @file_put_contents( $p, (string) time() ) !== false;
}

function UltraStats_ParserCancelPending( $serverId ) {
	$p = UltraStats_ParserCancelFlagPath( $serverId );
	return ( $p !== '' && is_file( $p ) );
}

function UltraStats_ParserCancelConsume( $serverId ) {
	$p = UltraStats_ParserCancelFlagPath( $serverId );
	if ( $p !== '' && is_file( $p ) ) {
		@unlink( $p );
		return true;
	}
	return false;
}

/**
 * Aborts the web parse at a safe point; clears the cancel flag, sets RELOADPARSER, log + SSE, updates server time.
 */
function UltraStats_ParserNotifyUserCancelled( $serverId, $message ) {
	UltraStats_ParserCancelConsume( $serverId );
	if ( ! defined( 'RELOADPARSER' ) ) {
		define( 'RELOADPARSER', true );
	}
	PrintHTMLDebugInfo( DEBUG_WARN, 'Gamelog', $message );
	if ( defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE && function_exists( 'UltraStats_ParserSseEmitEvent' ) ) {
		UltraStats_ParserSseEmitEvent( 'cancelled', array( 'message' => $message ) );
	}
	SetLastUpdateTime( $serverId );
}


?>