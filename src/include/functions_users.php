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
	* ->	User Include File
	*		Contains functions for the user management
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

// --- BEGIN Usermanagement Function ---

/**
 * Legacy installs store MD5 hex (32 chars). New hashes use password_hash() and are longer.
 */
function UltraStats_IsLegacyPasswordMd5( $stored ) {
	$s = (string) $stored;
	return strlen( $s ) === 32 && ctype_xdigit( $s );
}

/**
 * Verify plain password against stored value (MD5 or modern hash).
 */
function UltraStats_VerifyUserPassword( $plain, $stored ) {
	if ( UltraStats_IsLegacyPasswordMd5( $stored ) ) {
		return hash_equals( $stored, md5( (string) $plain ) );
	}
	return password_verify( (string) $plain, (string) $stored );
}

/**
 * Store this for new users or when changing passwords (PHP password_hash / PASSWORD_DEFAULT).
 */
function UltraStats_HashUserPassword( $plain ) {
	return password_hash( (string) $plain, PASSWORD_DEFAULT );
}

function CheckForUserLogin( $isloginpage, $isUpgradePage = false )
{
	global $content; 
	$content['isupdateavailable'] = false;

	if ( isset($_SESSION['SESSION_LOGGEDIN']) )
	{
		if ( !$_SESSION['SESSION_LOGGEDIN'] ) 
			RedirectToUserLogin();
		else
		{
			$content['SESSION_LOGGEDIN'] = "true";
			$content['SESSION_USERNAME'] = $_SESSION['SESSION_USERNAME'];
		}

		$httpHost = isset( $_SERVER['HTTP_HOST'] ) ? (string) $_SERVER['HTTP_HOST'] : '';
		$isLocalHost = ( strpos( $httpHost, '127.0.0.1' ) !== false || stripos( $httpHost, 'localhost' ) !== false );
		if ( $isLocalHost ) {
			$_SESSION['UPDATEAVAILABLE'] = false;
			unset( $_SESSION['UPDATEVERSION'] );
			unset( $_SESSION['UPDATELINK'] );
		}

		if ( isset($_SESSION['UPDATEAVAILABLE']) && $_SESSION['UPDATEAVAILABLE'] ) 
		{
			// Check Version numbers again to avoid update notification if update was done during meantime!
			if ( isset($_SESSION['UPDATEVERSION']) && CompareVersionNumbers($content['BUILDNUMBER'], $_SESSION['UPDATEVERSION']) )
			{
				$content['isupdateavailable'] = true;
				$content['isupdateavailable_updatelink'] = $_SESSION['UPDATELINK'];
				$content['UPDATE_AVAILABLETEXT'] = GetAndReplaceLangStr($content['LN_UPDATE_AVAILABLETEXT'], $content['BUILDNUMBER'], $_SESSION['UPDATEVERSION']);
			}
		}

		// New, Check for database Version and may redirect to updatepage!
		if (	isset($content['database_forcedatabaseupdate']) && 
				$content['database_forcedatabaseupdate'] == "yes" && 
				$isUpgradePage == false 
			)
				RedirectToDatabaseUpgrade();
	}
	else
	{
		if ( $isloginpage == false )
			RedirectToUserLogin();
	}

}

function CreateUserName( $username, $password, $access_level )
{
	$result = DB_QueryBound( "SELECT username FROM " . STATS_USERS . " WHERE username = ?", 's', array( $username ) );
	$rows   = DB_GetAllRows( $result, true );
	if ( ! empty( $rows ) ) {
		DieWithFriendlyErrorMsg( "User $username already exists!" );
		return false;
	}
	$hash = UltraStats_HashUserPassword( $password );
	$ok   = DB_ExecBound(
		"INSERT INTO " . STATS_USERS . " (username, password, access_level) VALUES (?, ?, ?)",
		'ssi',
		array( $username, $hash, (int) $access_level )
	);
	return (bool) $ok;
}

// Helper function to compare versions
function CompareVersionNumbers( $oldVer, $newVer )
{
	// Split version numbers
	$currentVersion = explode(".", $oldVer);
	$newVersion = explode(".", $newVer);

	// Check if the format is correct!
	if ( count($newVersion) != 3 )
		return false;

	// check for update
	if		( isset($newVersion[0]) && $newVersion[0] > $currentVersion[0] )
		return true;
	else if	( isset($newVersion[1]) && $newVersion[0] == $currentVersion[0] && $newVersion[1] > $currentVersion[1] )
		return true;
	else if ( isset($newVersion[2]) && $newVersion[0] == $currentVersion[0] && $newVersion[1] == $currentVersion[1] && $newVersion[2] > $currentVersion[2] )
		return true;
	else
		return false;
}

function CheckUserLogin( $username, $password )
{
	global $content, $CFG;

	$result = DB_QueryBound(
		"SELECT ID, password, access_level FROM " . STATS_USERS . " WHERE username = ?",
		's',
		array( (string) $username )
	);
	$rows = DB_GetAllRows( $result, true );
	if ( ! is_array( $rows ) || count( $rows ) !== 1 ) {
		if ( (int) $CFG['ShowDebugMsg'] === 1 ) {
			DieWithFriendlyErrorMsg( "Debug Error: Could not login user '" . $username . "' <br><br><b>Sessionarray</b> <pre>" . var_export( $_SESSION, true ) . '</pre>' );
		}
		return false;
	}
	$row = $rows[0];
	if ( ! UltraStats_VerifyUserPassword( $password, $row['password'] ) ) {
		if ( (int) $CFG['ShowDebugMsg'] === 1 ) {
			DieWithFriendlyErrorMsg( "Debug Error: password mismatch for user '" . $username . "'" );
		}
		return false;
	}
	// Rehash legacy MD5 to password_hash on successful login.
	if ( UltraStats_IsLegacyPasswordMd5( $row['password'] ) ) {
		$newHash = UltraStats_HashUserPassword( $password );
		DB_ExecBound( "UPDATE " . STATS_USERS . " SET password = ? WHERE ID = ?", 'si', array( $newHash, (int) $row['ID'] ) );
	}

	if ( function_exists( 'session_regenerate_id' ) ) {
		@session_regenerate_id( true );
	}
	UltraStats_AdminCsrfEnsureToken( true );
	$_SESSION['SESSION_LOGGEDIN']   = true;
	$_SESSION['SESSION_USERNAME']   = $username;
	$_SESSION['SESSION_ACCESSLEVEL'] = $row['access_level'];
	$_SESSION['UPDATEAVAILABLE']    = false;
	unset( $_SESSION['UPDATEVERSION'] );
	unset( $_SESSION['UPDATELINK'] );

	$content['SESSION_LOGGEDIN']   = "true";
	$content['SESSION_USERNAME']   = $username;

	$httpHost = isset( $_SERVER['HTTP_HOST'] ) ? (string) $_SERVER['HTTP_HOST'] : '';
	if ( strpos( $httpHost, '127.0.0.1' ) !== false || stripos( $httpHost, 'localhost' ) !== false ) {
		return true;
	}

	// --- Now we check for an UltraStats Update.
	// In local dev checkouts prefer the repo-local version.txt to avoid stale remote cache/noise.
	$updateSource = (string) $content['UPDATEURL'];
	$localVersionFile = dirname( __DIR__, 2 ) . '/doc-site/docs/version.txt';
	if ( $localVersionFile !== '' && file_exists( $localVersionFile ) ) {
		$updateSource = $localVersionFile;
	}
	$myHandle = @fopen( $updateSource, "r" );

	if ( $myHandle ) {
		$myBuffer = "";
		while ( ! feof( $myHandle ) ) {
			$myBuffer .= fgets( $myHandle, 4096 );
		}
		fclose( $myHandle );

		$myLines = explode( "\n", $myBuffer );

		$detectedVersion = isset( $myLines[0] ) ? trim( (string) $myLines[0] ) : '';
		if ( $detectedVersion !== '' && CompareVersionNumbers( $content['BUILDNUMBER'], $detectedVersion ) ) {
			$_SESSION['UPDATEAVAILABLE'] = true;
			$_SESSION['UPDATEVERSION']   = $detectedVersion;
			if ( isset( $myLines[1] ) ) {
				$_SESSION['UPDATELINK'] = $myLines[1];
			} else {
				$_SESSION['UPDATELINK'] = "https://alorbach.github.io/ultrastats/";
			}
		}
	}
	// ---

	return true;
}

function DoLogOff()
{
	global $content;

	unset( $_SESSION['SESSION_LOGGEDIN'] );
	unset( $_SESSION['SESSION_USERNAME'] );
	unset( $_SESSION['SESSION_ACCESSLEVEL'] );

	// Redir to Index Page
	RedirectPage( "index.php");
}

function RedirectToUserLogin()
{
	// TODO Referer
	header("Location: login.php?referer=" . $_SERVER['PHP_SELF']);
	exit;
}

function RedirectToDatabaseUpgrade()
{
	// TODO Referer
	header("Location: upgrade.php"); // ?referer=" . $_SERVER['PHP_SELF']);
	exit;
}

/*
* Helper function to print a secure check!
*/
function PrintSecureUserCheck( $warningtext, $yesmsg, $nomsg )
{
	global $content, $page;

	// Copy properties
	$content['warningtext'] = $warningtext;
	$content['yesmsg'] = $yesmsg;
	$content['nomsg'] = $nomsg;

	$content['POST_VARIABLES'] = array();

	$basename = basename( isset( $_SERVER['SCRIPT_NAME'] ) ? (string) $_SERVER['SCRIPT_NAME'] : '' );
	if ( $basename === '' || $basename === '.' || $basename === '..' ) {
		$basename = 'users.php';
	}
	$content['form_url'] = $basename;
	$content['cancel_url'] = $basename;

	foreach ( $_GET as $varname => $varvalue ) {
		if ( $varname === 'verify' ) {
			continue;
		}
		$content['POST_VARIABLES'][] = array(
			'varname'  => DB_RemoveBadChars( (string) $varname ),
			'varvalue' => is_array( $varvalue ) ? '' : DB_RemoveBadChars( (string) $varvalue ),
		);
	}

	foreach ( $_POST as $varname => $varvalue ) {
		if ( isset( $_GET[ $varname ] ) || $varname === US_ADMIN_CSRF_POST_FIELD || $varname === 'admin_confirm_delete' ) {
			continue;
		}
		$content['POST_VARIABLES'][] = array(
			'varname'  => DB_RemoveBadChars( (string) $varname ),
			'varvalue' => is_array( $varvalue ) ? '' : DB_RemoveBadChars( (string) $varvalue ),
		);
	}

	$content['POST_VARIABLES'][] = array(
		'varname'  => US_ADMIN_CSRF_POST_FIELD,
		'varvalue' => UltraStats_AdminCsrfEnsureToken(),
	);
	$content['POST_VARIABLES'][] = array(
		'varname'  => 'admin_confirm_delete',
		'varvalue' => '1',
	);

	// --- BEGIN CREATE TITLE
	$content['TITLE'] = InitPageTitle();
	$content['TITLE'] .= " :: Confirm Action";
	// --- END CREATE TITLE

	// --- Parsen and Output
	InitTemplateParser();
	$page -> parser($content, "admin/admin_securecheck.html");
	$page -> output(); 
	// --- 
	
	// Exit script execution
	exit;
}

// --- END Usermanagement Function --- 
?>
