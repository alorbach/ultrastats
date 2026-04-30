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
	* ->	Result File													
	*		Shows results 
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
require_once($gl_root_path . 'include/functions_common.php');

// Set PAGE to be ADMINPAGE!
define('IS_ADMINPAGE', true);
$content['IS_ADMINPAGE'] = true;

InitUltraStats();
// WTF OMFG WHY !!!!! $_SESSION is empty here :S:S:S:S! How the fuck can this be :S
CheckForUserLogin( false );
IncludeLanguageFile( $gl_root_path . 'lang/' . $LANG . '/admin.php' );

// Hardcoded atm
$content['REDIRSECONDS'] = 1;
// ***					*** //

// --- BEGIN Custom Code
$hadRedirParam = isset( $_GET['redir'] );
$redirRaw      = $hadRedirParam ? urldecode( (string) $_GET['redir'] ) : 'index.php';
$safeRedir     = UltraStats_SanitizeRedirectTarget( $redirRaw );
if ( ! $hadRedirParam ) {
	$_GET['redir'] = $safeRedir;
}
$content['SZREDIR'] = $safeRedir;

$sec = (int) $content['REDIRSECONDS'];
if ( $sec < 1 ) {
	$sec = 1;
}
if ( $sec > 120 ) {
	$sec = 120;
}
$content['REDIRSECONDS'] = $sec;

if ( $hadRedirParam ) {
	$metaUrl = UltraStats_h( $safeRedir );
	$content['EXTRA_METATAGS'] = '<meta http-equiv="refresh" content="' . $sec . '; url=' . $metaUrl . '">';
}

if ( isset( $_GET['msg'] ) ) {
	$content['SZMSG'] = UltraStats_h( urldecode( (string) $_GET['msg'] ) );
} else {
	$content['SZMSG'] = '*Unknown State';
}

$hrefEsc = UltraStats_h( $safeRedir );
$content['RESULT_REDIRTXT'] = GetAndReplaceLangStr( $content['LN_RESULT_REDIRTXT'], $hrefEsc, (string) $sec );
// --- 

// --- BEGIN CREATE TITLE
$content['TITLE'] = InitPageTitle();
$content['TITLE'] .= " :: " . GetAndReplaceLangStr( $content['LN_RESULT_REDIRTITLE'], $content['REDIRSECONDS']);
// --- END CREATE TITLE

// --- Parsen and Output
InitTemplateParser();
$page -> parser($content, "admin/result.html");
$page -> output(); 
// --- 

?>