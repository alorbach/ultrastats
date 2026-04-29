<?php
/*
	********************************************************************
	* Copyright by Andre Lorbach | 2006-2026						
	* -> https://alorbach.github.io/ultrastats <-											
	* ------------------------------------------------------------------
	*
	* Use this script at your own risk!									
	*
	* ------------------------------------------------------------------
	* ->	UserChange File
	*		Helper script to change user options and redirect to the 
	*		previous page. 
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
$gl_root_path = './';
include($gl_root_path . 'include/functions_common.php');
include($gl_root_path . 'include/functions_frontendhelpers.php');

InitUltraStats();
InitFrontEndDefaults();	// Only in WebFrontEnd
// ***					*** //

// --- BEGIN Custom Code
$szRedir = "index.php";
if ( isset( $_SERVER['HTTP_REFERER'] ) && $_SERVER['HTTP_REFERER'] !== "" ) {
	$ref  = $_SERVER['HTTP_REFERER'];
	$p    = @parse_url( $ref );
	$ourH = isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : '';
	// Same-host check: HTTP_HOST may include :port; parse_url(referer) host does not.
	$reqHostParsed = ( $ourH !== '' ) ? @parse_url( 'http://' . $ourH ) : false;
	$reqHost       = ( is_array( $reqHostParsed ) && isset( $reqHostParsed['host'] ) ) ? strtolower( $reqHostParsed['host'] ) : '';
	$reqPort       = ( is_array( $reqHostParsed ) && isset( $reqHostParsed['port'] ) ) ? (int) $reqHostParsed['port'] : null;
	$refHost       = ( is_array( $p ) && isset( $p['host'] ) ) ? strtolower( $p['host'] ) : '';
	$refPort       = ( is_array( $p ) && isset( $p['port'] ) ) ? (int) $p['port'] : null;
	$portsOk       = true;
	if ( $refPort !== null && $reqPort !== null && $refPort !== $reqPort ) {
		$portsOk = false;
	}
	if ( is_array( $p ) && $refHost !== '' && $reqHost !== '' && $refHost === $reqHost && $portsOk ) {
		$refPath = isset( $p['path'] ) ? str_replace( '\\', '/', $p['path'] ) : '';
		$scriptDir = str_replace( '\\', '/', dirname( isset( $_SERVER['SCRIPT_NAME'] ) ? $_SERVER['SCRIPT_NAME'] : '' ) );
		$scriptDir = rtrim( $scriptDir, '/' );
		// Relative Location is resolved against the directory of userchange.php. Strip the URL
		// directory prefix so /app/players.php becomes players.php, not app/players.php (which
		// would wrongly resolve to /app/app/players.php when the app lives under /app/).
		if ( $scriptDir !== '' && $scriptDir !== '/' && $refPath !== '' && strpos( $refPath, $scriptDir . '/' ) === 0 ) {
			$path = substr( $refPath, strlen( $scriptDir ) + 1 );
		} else {
			$path = ltrim( $refPath, '/' );
		}
		if ( $path === "" ) {
			$path = "index.php";
		}
		$q = isset( $p['query'] ) && $p['query'] !== "" ? "?" . $p['query'] : "";
		$szRedir = $path . $q;
	}
	$szRedir = UltraStats_SanitizeRedirectTarget( $szRedir );
}


if ( isset($_GET['op']) )
{
	if		( $_GET['op'] == "changestyle" ) 
	{
		if ( VerifyTheme($_GET['stylename']) ) 
			$_SESSION['CUSTOM_THEME'] = $_GET['stylename'];
	}
	else if ( $_GET['op'] == "changelang" ) 
	{
		if ( VerifyLanguage($_GET['langcode']) ) 
			$_SESSION['CUSTOM_LANG'] = $_GET['langcode'];
	}
	else if ( $_GET['op'] == "changeyear" ) 
	{
		if ( $content['ENABLETIMEFILTER'] ) 
		{
			if ( $_GET['newyear'] == "ALL_YEARS" ) 
			{
				unset( $_SESSION['TIME_SELECTEDYEAR'] );
				unset( $_SESSION['TIME_SELECTEDMONTH'] );
			}
			else if ( isset($content['TIMEYEARS'][ $_GET['newyear'] ]) ) 
			{
				$_SESSION['TIME_SELECTEDYEAR'] = $_GET['newyear'];

				// Unset current month selection!
				unset( $_SESSION['TIME_SELECTEDMONTH'] );
			}
		}
	}
	else if ( $_GET['op'] == "changemonth" ) 
	{
		if ( $content['ENABLETIMEFILTER'] ) 
		{
			if ( $_GET['newmonth'] == "ALL_MONTHS" ) 
				unset($_SESSION['TIME_SELECTEDMONTH']);
			else if ( isset($_SESSION['TIME_SELECTEDYEAR']) && isset($content['TIMEMONTHS'][ $_GET['newmonth'] ]) ) 
				$_SESSION['TIME_SELECTEDMONTH'] = $_GET['newmonth'];
		}
	}
}

// Final redirect
RedirectPage( $szRedir );
// --- 
?>