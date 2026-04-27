<?php
/**
 * Admin entry for the log parser. Requires admin login. Query `op` and optional `id` (server) drive parser-core.
 * @package UltraStats
 */
/*
	********************************************************************
	* Copyright by Andre Lorbach | 2006, 2007, 2008
	* -> www.ultrastats.org <-
	* ------------------------------------------------------------------
	* ->	Parser File
	*		This file wraps the parser
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
$content['TITLE'] .= " :: Parser ";
// --- END CREATE TITLE


// --- BEGIN Custom Code
// Now the processing Part
if ( isset($_GET['op']) )
	$content['parseroperation'] = DB_RemoveBadChars($_GET['op']);
else
	$content['parseroperation'] = "";

if ( isset($_GET['op']) )
{
	if ( isset($_GET['id']) && is_numeric($_GET['id']) )
	{
		$content['serverid'] = DB_RemoveBadChars( $_GET['id'] );
		$sid = (int) $content['serverid'];

		// Get ServerDetails first 
		$result = DB_QueryBound( "SELECT * FROM " . STATS_SERVERS . " WHERE ID = ?", 'i', array( $sid ) );
		$content['SERVER'] = DB_GetAllRows( $result, true );

		if ( ! empty( $content['SERVER'] ) )
		{
			$content['GameLogLocation'] = $content['SERVER'][0]['GameLogLocation'];
			$content['LastLogLine'] = $content['SERVER'][0]['LastLogLine'];
			// Server found - now check for the action
			if (	$content['parseroperation'] == 'updatestats' || 
					$content['parseroperation'] == 'delete' || 
					$content['parseroperation'] == 'deletestats' || 
					$content['parseroperation'] == 'createaliases' || 
					$content['parseroperation'] == 'getnewlogfile' || 
					$content['parseroperation'] == 'resetlastlogline' 
				)
			{
				// Set Embedded Parser to True
				$content['RUNPARSER'] = "true";
			}
		}
		else
		{
			$content['ISERROR'] = "true";
			$content['ERROR_MSG'] = "*Error, Server with ID '$serverid' not found in database";
		}
	}
	else if ( 
				$content['parseroperation'] == 'runtotals' ||
				$content['parseroperation'] == 'createaliases' ||
				$content['parseroperation'] == 'calcmedalsonly' ||
				$content['parseroperation'] == 'calcdamagetypekills' ||
				$content['parseroperation'] == 'calcweaponkills' ||
				$content['parseroperation'] == 'databaseopt'
			) 
	{
		// Set Embedded Parser to True
		$content['RUNPARSER'] = "true";
	}
	else
	{
		$content['ISERROR'] = "true";
		$content['ERROR_MSG'] = "*Error, no or invalid Server ID given";
	}
}
// --- 

// --- Parsen and Output
InitTemplateParser();
$page -> parser($content, "admin/parser.html");
$page -> output(); 
// --- 

?>