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
	* ->	Player Admin File													
	*		Administrates Players in UltraStats 
	*																	
	* This file is part of UltraStats
	*
	* UltraStats is free software: you can redistribute it and/or modify
	* it under the terms of the GNU General Public License as published
	* by the Free Software Foundation, either version 3 of the License,
	* or (at your option) any later version.
	********************************************************************
*/


// *** Default includes	and procedures *** //
define('IN_ULTRASTATS', true);
$gl_root_path = './../';
include($gl_root_path . 'include/functions_common.php');

// Set PAGE to be ADMINPAGE!
define('IS_ADMINPAGE', true);
$content['IS_ADMINPAGE'] = true;

InitUltraStats();
CheckForUserLogin( false );
IncludeLanguageFile( $gl_root_path . 'lang/' . $LANG . '/admin.php' );
// ***					*** //

// --- BEGIN CREATE TITLE
$content['TITLE'] = InitPageTitle();
$content['TITLE'] .= " :: Player Admin";
// --- END CREATE TITLE


// --- Read Vars
if ( isset($_GET['start']) )
	$content['current_pagebegin'] = intval(DB_RemoveBadChars($_GET['start']));
else
	$content['current_pagebegin'] = 0;

if ( isset($_GET['playerfilter']) && strlen($_GET['playerfilter']) > 0 )
{
	$content['playerfilter'] = DB_RemoveBadChars($_GET['playerfilter']);
}
else
{
	$content['playerfilter'] = "";
}

if ( isset($_GET['playerop']) )
{
	if ( isset($_GET['playerguid']) && is_numeric($_GET['playerguid']) )
	{
		// Get PlayerID ;)
		$playerid = DB_RemoveBadChars($_GET['playerguid']);
		if ( isset($_GET['newval']) )
		{
			$newval = intval($_GET['newval']);
			if ( $newval == 0 || $newval == 1) 
			{
				$pguid = (int) $playerid;
				// Check for Clanmember
				if ( $_GET['playerop'] == "setclanmember" ) 
				{
					DB_ExecBound(
						"UPDATE " . STATS_PLAYERS_STATIC . " SET ISCLANMEMBER = ? WHERE GUID = ?",
						'ii',
						array( $newval, $pguid )
					);
				}
				else if ( $_GET['playerop'] == "setban" ) 
				{
					DB_ExecBound(
						"UPDATE " . STATS_PLAYERS_STATIC . " SET ISBANNED = ? WHERE GUID = ?",
						'ii',
						array( $newval, $pguid )
					);
				}
			}
		}
	}
}

// ---

// Set Referer vars 
if ( isset($_SERVER['HTTP_REFERER']) && strlen($_SERVER['HTTP_REFERER']) > 0 )
	$content['encoded_referer'] = urlencode($_SERVER['HTTP_REFERER']);
else
	$content['encoded_referer'] = "";

if ( isset($_POST['referer']) && strlen($_POST['referer']) > 0 )
	$content['received_referer'] = urldecode($_POST['referer']);
else
	$content['received_referer'] = "";
// --- 


// --- BEGIN Custom Code
if ( isset($_GET['op']) )
{
	if ($_GET['op'] == "edit") 
	{
		// Set Mode to edit
		$content['ISEDITPLAYER'] = "true";
		$content['PLAYER_FORMACTION'] = "edit";
		$content['PLAYER_SENDBUTTON'] = $content['LN_PLAYER_EDIT'];

		if ( isset($_GET['id']) && is_numeric($_GET['id']) )
		{
			//PreInit these values 
			$content['GUID'] = DB_RemoveBadChars($_GET['id']);
			$guidEdit        = (int) $content['GUID'];

			$sqlquery = "SELECT " . 
						STATS_PLAYERS_STATIC . ".GUID, " . 
						STATS_PLAYERS_STATIC . ".PBGUID, " . 
						STATS_PLAYERS_STATIC . ".ISCLANMEMBER, " . 
						STATS_PLAYERS_STATIC . ".ISBANNED, " . 
						STATS_PLAYERS_STATIC . ".BanReason, " . 
						STATS_ALIASES . ".Alias, " . 
						STATS_ALIASES . ".AliasAsHtml " .
						" FROM " . STATS_PLAYERS_STATIC . 
						" INNER JOIN (" . STATS_ALIASES . 
						") ON (" . 
						STATS_PLAYERS_STATIC . ".GUID=" . STATS_ALIASES . ".PLAYERID) " . 
						" WHERE " . STATS_PLAYERS_STATIC . ".GUID = ? " . 
						" GROUP BY " . STATS_PLAYERS_STATIC . ".GUID " . 
						" ORDER BY " . STATS_ALIASES . ".Alias " ; 

			$result = DB_QueryBound( $sqlquery, 'i', array( $guidEdit ) );
			$myrow = DB_GetSingleRow($result, true);
			if ( isset($myrow['GUID'] ) )
			{
				$content['PBGUID'] = $myrow['PBGUID'];
				$content['BanReason'] = $myrow['BanReason'];
				$content['Alias'] = $myrow['Alias'];
				$content['AliasAsHtml'] = $myrow['AliasAsHtml'];

				if ( $myrow['ISCLANMEMBER'] == 1 ) 
					$content['CHECKED_ISCLANMEMBED'] = "checked";
				if ( $myrow['ISBANNED'] == 1 ) 
					$content['CHECKED_ISBANNED'] = "checked";
			}
			else
			{
				$content['ISERROR'] = "true";
				$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_PLAYER_ERROR_NOTFOUND'], $content['GUID'] ); 
			}
		}
		else
		{
			$content['ISERROR'] = "true";
			$content['ERROR_MSG'] = $content['LN_PLAYER_ERROR_INVID'];
		}
	}
	else if ($_GET['op'] == "delete") 
	{
		// Set Mode to edit
		$content['ISDELETEPLAYER'] = "true";

		if ( isset($_GET['id']) && is_numeric($_GET['id']) )
		{
			//PreInit these values 
			$content['GUID'] = DB_RemoveBadChars($_GET['id']);
			$content['AliasName'] = GetPlayerHtmlNameFromID( $content['GUID'] );

			if ( isset($_GET['verify']) || $_GET['verify'] == "yes" )
			{
				// Disable Verify few
				$content['ISVERIFY'] = "false";

				$delGuid = (int) $content['GUID'];

				// Start Deleting the User stats! (bound deletes; SQL_CMD kept for display with numeric id)
				DB_ExecBound( "DELETE FROM " . STATS_ALIASES . " WHERE PLAYERID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][0]['SQL_CMD'] = "DELETE FROM " . STATS_ALIASES . " WHERE PLAYERID = " . $delGuid;
				$content['DeletedData'][0]['NAME'] = STATS_ALIASES;
				$content['DeletedData'][0]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][0]['cssclass'] = "line1";

				DB_ExecBound( "DELETE FROM " . STATS_CHAT . " WHERE PLAYERID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][1]['SQL_CMD'] = "DELETE FROM " . STATS_CHAT . " WHERE PLAYERID = " . $delGuid;
				$content['DeletedData'][1]['NAME'] = STATS_CHAT;
				$content['DeletedData'][1]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][1]['cssclass'] = "line2";

				DB_ExecBound( "DELETE FROM " . STATS_PLAYER_KILLS . " WHERE PLAYERID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][2]['SQL_CMD'] = "DELETE FROM " . STATS_PLAYER_KILLS . " WHERE PLAYERID = " . $delGuid;
				$content['DeletedData'][2]['NAME'] = STATS_PLAYER_KILLS;
				$content['DeletedData'][2]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][2]['cssclass'] = "line1";

				DB_ExecBound( "DELETE FROM " . STATS_PLAYER_KILLS . " WHERE ENEMYID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][3]['SQL_CMD'] = "DELETE FROM " . STATS_PLAYER_KILLS . " WHERE ENEMYID = " . $delGuid;
				$content['DeletedData'][3]['NAME'] = STATS_PLAYER_KILLS;
				$content['DeletedData'][3]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][3]['cssclass'] = "line2";

				DB_ExecBound( "DELETE FROM " . STATS_PLAYERS . " WHERE GUID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][4]['SQL_CMD'] = "DELETE FROM " . STATS_PLAYERS . " WHERE GUID = " . $delGuid;
				$content['DeletedData'][4]['NAME'] = STATS_PLAYERS;
				$content['DeletedData'][4]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][4]['cssclass'] = "line1";

				DB_ExecBound( "DELETE FROM " . STATS_PLAYERS_STATIC . " WHERE GUID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][5]['SQL_CMD'] = "DELETE FROM " . STATS_PLAYERS_STATIC . " WHERE GUID = " . $delGuid;
				$content['DeletedData'][5]['NAME'] = STATS_PLAYERS_STATIC;
				$content['DeletedData'][5]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][5]['cssclass'] = "line2";

				DB_ExecBound( "DELETE FROM " . STATS_PLAYERS_TOPALIASES . " WHERE GUID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][6]['SQL_CMD'] = "DELETE FROM " . STATS_PLAYERS_TOPALIASES . " WHERE GUID = " . $delGuid;
				$content['DeletedData'][6]['NAME'] = STATS_PLAYERS_TOPALIASES;
				$content['DeletedData'][6]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][6]['cssclass'] = "line1";

				DB_ExecBound( "DELETE FROM " . STATS_ROUNDACTIONS . " WHERE PLAYERID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][7]['SQL_CMD'] = "DELETE FROM " . STATS_ROUNDACTIONS . " WHERE PLAYERID = " . $delGuid;
				$content['DeletedData'][7]['NAME'] = STATS_ROUNDACTIONS;
				$content['DeletedData'][7]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][7]['cssclass'] = "line2";

				DB_ExecBound( "DELETE FROM " . STATS_TIME . " WHERE PLAYERID = ?", 'i', array( $delGuid ), false );
				$content['DeletedData'][8]['SQL_CMD'] = "DELETE FROM " . STATS_TIME . " WHERE PLAYERID = " . $delGuid;
				$content['DeletedData'][8]['NAME'] = STATS_TIME;
				$content['DeletedData'][8]['DELETED_RECORD'] = GetRowsAffected();
				$content['DeletedData'][8]['cssclass'] = "line1";
			}
			else
			{
				// Enable Verify few
				$content['ISVERIFY'] = "true";
			}
		}
	}

	if ( isset($_POST['op']) )
	{
		if ( isset ($_POST['id']) ) { $content['GUID'] = DB_RemoveBadChars($_POST['id']); } else {$content['GUID'] = 0; }

		if ( isset ($_POST['playerpbguid']) ) { $content['PBGUID'] = DB_RemoveBadChars($_POST['playerpbguid']); } else {$content['PBGUID'] = ""; }
		if ( isset ($_POST['banreason']) ) { $content['BanReason'] = DB_RemoveBadChars($_POST['banreason']); } else {$content['BanReason'] = ""; }
		if ( isset ($_POST['isclanmember']) ) { $content['ISCLANMEMBER'] = true; } else {$content['ISCLANMEMBER'] = 0; }
		if ( isset ($_POST['isbanned']) ) { $content['ISBANNED'] = true; } else {$content['ISBANNED'] = 0; }

		// Check mandotary values
		if ( !isset($content['GUID']) || $content['GUID'] == 0 )
		{
			$content['ISERROR'] = "true";
			$content['ERROR_MSG'] = $content['LN_PLAYER_ERROR_PLAYERIDEMPTY'];
		}

		if ( !isset($content['ISERROR']) ) 
		{	
			if ( $_POST['op'] == "edit" )
			{
				$guid = (int) $content['GUID'];
				$result = DB_QueryBound( "SELECT GUID FROM " . STATS_PLAYERS_STATIC . " WHERE GUID = ?", 'i', array( $guid ) );
				$myrow = DB_GetSingleRow($result, true);
				if ( ! is_array( $myrow ) || ! isset( $myrow['GUID'] ) )
				{
					$content['ISERROR'] = "true";
					$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_PLAYER_ERROR_NOTFOUND'], $content['GUID'] ); 
				}
				else
				{
					// Edit the Player now!
					DB_ExecBound(
						"UPDATE " . STATS_PLAYERS_STATIC . " SET PBGUID = ?, ISCLANMEMBER = ?, ISBANNED = ?, BanReason = ? WHERE GUID = ?",
						'siisi',
						array(
							$content['PBGUID'],
							(int) $content['ISCLANMEMBER'],
							(int) $content['ISBANNED'],
							$content['BanReason'],
							$guid,
						)
					);

					// Redirect - may with PAGER later!
					if ( strlen( $content['received_referer'] ) > 0 )
						RedirectResult( GetAndReplaceLangStr( $content['LN_PLAYER_SUCCEDIT'], $content['GUID'] ) , $content['received_referer'] );
					else
						RedirectResult( GetAndReplaceLangStr( $content['LN_PLAYER_SUCCEDIT'], $content['GUID'] ) , "players.php" );
				}
			}
		}
	}
}
else
{
	// Default Mode = List Players
	$content['LISTPLAYERS'] = "true";

	// --- First get the Count and Set Pager Variables (optional filter: bound LIKE on alias)
	$fromPart = " FROM " . STATS_PLAYERS_STATIC .
		" INNER JOIN (" . STATS_PLAYERS_TOPALIASES . ", " . STATS_ALIASES .
		") ON (" .
		STATS_PLAYERS_STATIC . ".GUID=" . STATS_PLAYERS_TOPALIASES . ".GUID AND " .
		STATS_PLAYERS_TOPALIASES . ".ALIASID=" . STATS_ALIASES . ".ID " .
		") ";
	$countSelect = "SELECT count(" . STATS_PLAYERS_STATIC . ".GUID) as PlayersCount " . $fromPart;
	$groupBy       = " GROUP BY " . STATS_PLAYERS_STATIC . ".GUID ";

	if ( strlen( $content['playerfilter'] ) > 0 ) {
		$likepat    = UltraStats_SqlLikeContainsPattern( $content['playerfilter'] );
		$where      = " WHERE " . STATS_ALIASES . ".Alias LIKE ? ";
		$countSql   = $countSelect . $where . $groupBy;
		$cres       = DB_QueryBound( $countSql, 's', array( $likepat ) );
		$content['players_count'] = 0;
		if ( $cres instanceof mysqli_result ) {
			$content['players_count'] = mysqli_num_rows( $cres );
			DB_FreeQuery( $cres );
		}
	} else {
		$countSql = $countSelect . $groupBy;
		$content['players_count'] = DB_GetRowCount( $countSql );
	}
	if ( $content['players_count'] > $content['admin_maxplayers'] ) 
	{
		$pagenumbers = $content['players_count'] / $content['admin_maxplayers'];

		// Check PageBeginValue
		if ( $content['current_pagebegin'] > $content['players_count'] )
			$content['current_pagebegin'] = 0;

		// Enable Player Pager
		$content['players_pagerenabled'] = "true";
	}
	else
	{
		$content['current_pagebegin'] = 0;
		$pagenumbers = 0;
	}
	
	// Set text
	$content['players_count_text'] = GetAndReplaceLangStr( $content['LN_PLAYER_PLAYERCOUNT'], $content['players_count']);


	// --- 

// --- Now the final query !
	$listSelect = "SELECT " .
				STATS_PLAYERS_STATIC . ".GUID, " .
				STATS_PLAYERS_STATIC . ".PBGUID, " .
				STATS_PLAYERS_STATIC . ".ISCLANMEMBER, " .
				STATS_PLAYERS_STATIC . ".ISBANNED, " .
				STATS_ALIASES . ".Alias, " .
				STATS_ALIASES . ".AliasAsHtml " .
				$fromPart;
	$orderLimit = " GROUP BY " . STATS_PLAYERS_STATIC . ".GUID " .
				" ORDER BY " . STATS_ALIASES . ".Alias " .
				" LIMIT ?, ?";
	$pb         = (int) $content['current_pagebegin'];
	$pl         = (int) $content['admin_maxplayers'];

	if ( strlen( $content['playerfilter'] ) > 0 ) {
		$likepat  = UltraStats_SqlLikeContainsPattern( $content['playerfilter'] );
		$where    = " WHERE " . STATS_ALIASES . ".Alias LIKE ? ";
		$listSql  = $listSelect . $where . $orderLimit;
		$result   = DB_QueryBound( $listSql, 'sii', array( $likepat, $pb, $pl ) );
	} else {
		$listSql = $listSelect . $orderLimit;
		$result  = DB_QueryBound( $listSql, 'ii', array( $pb, $pl ) );
	}
	if ( ! $result || ! ( $result instanceof mysqli_result ) ) {
		$content['PLAYERS'] = array();
	} else {
		$content['PLAYERS'] = DB_GetAllRows( $result, true );
	}

	// For the eye
	$css_class = "line";
	for($i = 0; $i < count($content['PLAYERS']); $i++)
	{
		// --- Set Number
		$content['PLAYERS'][$i]['Number'] = $i+1;
		// ---

		// --- Set Image for IsClanMember
		if ( $content['PLAYERS'][$i]['ISCLANMEMBER'] ) 
		{
			$content['PLAYERS'][$i]['is_clanmember_string'] = $content['MENU_SELECTION_ENABLED'];
			$content['PLAYERS'][$i]['set_clanmember'] = 0;
		}
		else
		{
			$content['PLAYERS'][$i]['is_clanmember_string'] = $content['MENU_SELECTION_DISABLED'];
			$content['PLAYERS'][$i]['set_clanmember'] = 1;
		}
		// ---

		// --- Set Image for IsBanned
		if ( $content['PLAYERS'][$i]['ISBANNED'] ) 
		{
			$content['PLAYERS'][$i]['is_banned_string'] = $content['MENU_SELECTION_ENABLED'];
			$content['PLAYERS'][$i]['set_banned'] = 0;
		}
		else
		{
			$content['PLAYERS'][$i]['is_banned_string'] = $content['MENU_SELECTION_DISABLED'];
			$content['PLAYERS'][$i]['set_banned'] = 1;
		}
		// ---


		// --- Set CSS Class
		if ( $i % 2 == 0 )
			$content['PLAYERS'][$i]['cssclass'] = "line1";
		else
			$content['PLAYERS'][$i]['cssclass'] = "line2";
		// --- 
	}

	// --- Now we create the Pager ;)!
		// Fix for now of the list exceeds $CFG['MAX_PAGES_COUNT'] pages
		if ($pagenumbers > $content['admin_maxpages'])
		{
			$content['PLAYERS_MOREPAGES'] = GetAndReplaceLangStr( $content['LN_ADMIN_MOREPAGES'], $content['admin_maxpages'] ); 
			$pagenumbers = $content['admin_maxpages'];
		}
		else
			$content['PLAYERS_MOREPAGES'] = "&nbsp;";

		for ($i=0 ; $i < $pagenumbers ; $i++)
		{
			$content['PLAYERPAGES'][$i]['mypagebegin'] = ($i * $content['admin_maxplayers']);

			if ($content['current_pagebegin'] == $content['PLAYERPAGES'][$i]['mypagebegin'])
				$content['PLAYERPAGES'][$i]['mypagenumber'] = "<B>-> ".($i+1)." <-</B>";
			else
				$content['PLAYERPAGES'][$i]['mypagenumber'] = $i+1;

			// --- Set CSS Class
			if ( $i % 2 == 0 )
				$content['PLAYERPAGES'][$i]['cssclass'] = "line1";
			else
				$content['PLAYERPAGES'][$i]['cssclass'] = "line2";
			// --- 
		}
	// ---
}

// --- END Custom Code

// --- Parsen and Output
InitTemplateParser();
$page -> parser($content, "admin/players.html");
$page -> output(); 
// --- 

?>