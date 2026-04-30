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
	* ->	User Admin File													
	*		File to administrate user accounts 
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
$content['TITLE'] .= " :: User Admin";
// --- END CREATE TITLE


// --- BEGIN Custom Code

// Confirmed delete (POST + CSRF): PRG via RedirectResult below.
if ( ( isset( $_SERVER['REQUEST_METHOD'] ) ? $_SERVER['REQUEST_METHOD'] : '' ) === 'POST'
	&& isset( $_POST['op'], $_POST['id'], $_POST['admin_confirm_delete'] )
	&& $_POST['op'] === 'delete'
	&& $_POST['admin_confirm_delete'] === '1' ) {

	if ( ! UltraStats_AdminCsrfPostedTokenMatches() ) {
		DieWithFriendlyErrorMsg( 'Invalid session security token — please reopen the confirmation page from the users list.' );
	}
	UltraStats_AdminCsrfEnsureToken( true );

	if ( ! isset( $_SESSION['SESSION_USERNAME'] ) ) {
		DieWithFriendlyErrorMsg( $content['LN_USER_ERROR_WTFOMFGGG'] );
	}

	$content['USERID'] = DB_RemoveBadChars( $_POST['id'] );
	$uid               = (int) $content['USERID'];

	$result = DB_QueryBound( 'SELECT username FROM ' . STATS_USERS . ' WHERE ID = ?', 'i', array( $uid ) );
	$myrow  = DB_GetSingleRow( $result, true );
	if ( ! isset( $myrow['username'] ) ) {
		$content['ISERROR'] = 'true';
		$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_USER_ERROR_IDNOTFOUND'], $content['USERID'] );
	} elseif ( $_SESSION['SESSION_USERNAME'] === $myrow['username'] ) {
		$content['ISERROR'] = 'true';
		$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_USER_ERROR_DONOTDELURSLF'], $content['USERID'] );
	} else {
		$ok = DB_ExecBound( 'DELETE FROM ' . STATS_USERS . ' WHERE ID = ?', 'i', array( $uid ) );
		if ( ! $ok ) {
			$content['ISERROR'] = 'true';
			$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_USER_ERROR_DELUSER'], $content['USERID'] );
		} else {
			RedirectResult( GetAndReplaceLangStr( $content['LN_USER_ERROR_HASBEENDEL'], $myrow['username'] ), 'users.php' );
		}
	}
}

if ( isset($_GET['op']) )
{
	if ($_GET['op'] == "add") 
	{
		// Set Mode to add
		$content['ISEDITORNEWUSER'] = "true";
		$content['USER_FORMACTION'] = "addnewuser";
		$content['USER_SENDBUTTON'] = $content['LN_USER_ADD'];

		//PreInit these values 
		$content['USERNAME'] = "";
		$content['PASSWORD1'] = "";
		$content['PASSWORD2'] = "";
	}
	else if ($_GET['op'] == "edit") 
	{
		// Set Mode to edit
		$content['ISEDITORNEWUSER'] = "true";
		$content['USER_FORMACTION'] = "edituser";
		$content['USER_SENDBUTTON'] = $content['LN_USER_EDIT'];

		if ( isset($_GET['id']) )
		{
			//PreInit these values 
			$content['USERID'] = DB_RemoveBadChars($_GET['id']);
			$uid   = (int) $content['USERID'];

			$result = DB_QueryBound(
				"SELECT * FROM " . STATS_USERS . " WHERE ID = ?",
				'i',
				array( $uid )
			);
			$myuser = DB_GetSingleRow( $result, true );
			if ( isset($myuser['username']) )
			{
				$content['USERID'] = $myuser['ID'];
				$content['USERNAME'] = $myuser['username'];
			}
			else
			{
				$content['ISERROR'] = "true";
				$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_USER_ERROR_IDNOTFOUND'], $content['USERID'] );
			}
		}
		else
		{
			$content['ISERROR'] = "true";
			$content['ERROR_MSG'] = "*Error, invalid ID, User not found";
		}
	}
	else if ($_GET['op'] == "delete") 
	{
		if ( isset($_GET['id']) )
		{
			//PreInit these values 
			$content['USERID'] = DB_RemoveBadChars($_GET['id']);
			$uid              = (int) $content['USERID'];

			if ( !isset($_SESSION['SESSION_USERNAME']) )
			{
				$content['ISERROR'] = "true";
				$content['ERROR_MSG'] = $content['LN_USER_ERROR_WTFOMFGGG'];
			}
			else
			{
				// Get UserInfo
				$result = DB_QueryBound( "SELECT username FROM " . STATS_USERS . " WHERE ID = ?", 'i', array( $uid ) );
				$myrow = DB_GetSingleRow( $result, true );
				if ( !isset($myrow['username']) )
				{
					$content['ISERROR'] = "true";
					$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_USER_ERROR_IDNOTFOUND'], $content['USERID'] ); 
				}
				else if ( $_SESSION['SESSION_USERNAME'] == $myrow['username'] )
				{
					$content['ISERROR'] = "true";
					$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_USER_ERROR_DONOTDELURSLF'], $content['USERID'] ); 
				}
				else
				{
					UltraStats_AdminCsrfEnsureToken();
					PrintSecureUserCheck( GetAndReplaceLangStr( $content['LN_USER_WARNDELETEUSER'], $myrow['username'] ), $content['LN_DELETEYES'], $content['LN_DELETENO'] );
				}
			}
		}
		else
		{
			$content['ISERROR'] = "true";
			$content['ERROR_MSG'] = $content['LN_USER_ERROR_INVALIDID'];
		}
	}

	if ( isset($_POST['op']) && $_POST['op'] !== 'delete' )
	{
		if ( isset ($_POST['id']) ) { $content['USERID'] = DB_RemoveBadChars($_POST['id']); } else {$content['USERID'] = ""; }
		if ( isset ($_POST['username']) ) { $content['USERNAME'] = DB_RemoveBadChars($_POST['username']); } else {$content['USERNAME'] = ""; }
		if ( isset ($_POST['password1']) ) { $content['PASSWORD1'] = DB_RemoveBadChars($_POST['password1']); } else {$content['PASSWORD1'] = ""; }
		if ( isset ($_POST['password2']) ) { $content['PASSWORD2'] = DB_RemoveBadChars($_POST['password2']); } else {$content['PASSWORD2'] = ""; }

		// Check mandotary values
		if ( $content['USERNAME'] == "" )
		{
			$content['ISERROR'] = "true";
			$content['ERROR_MSG'] = $content['LN_USER_ERROR_USEREMPTY'];
		}

		if ( !isset($content['ISERROR']) ) 
		{	
			// Everything was alright, so we go to the next step!
			if ( $_POST['op'] == "addnewuser" )
			{
				$result = DB_QueryBound(
					"SELECT username FROM " . STATS_USERS . " WHERE username = ?",
					's',
					array( $content['USERNAME'] )
				);
				$myrow = DB_GetSingleRow( $result, true );
				if ( isset($myrow['username']) )
				{
					$content['ISERROR'] = "true";
					$content['ERROR_MSG'] = $content['LN_USER_ERROR_USERNAMETAKEN'];
				}
				else
				{
					// Check if Password is set!
					if (	strlen($content['PASSWORD1']) <= 0 ||
							$content['PASSWORD1'] != $content['PASSWORD2'] )
					{
						$content['ISERROR'] = "true";
						$content['ERROR_MSG'] = $content['LN_USER_ERROR_PASSSHORT'];
					}

					if ( !isset($content['ISERROR']) ) 
					{	
						// Create password hash (password_hash; legacy MD5 no longer used for new users).
						$content['PASSWORDHASH'] = UltraStats_HashUserPassword( $content['PASSWORD1'] );

						// Add new User now!
						DB_ExecBound(
							"INSERT INTO " . STATS_USERS . " (username, password) VALUES (?, ?)",
							'ss',
							array( $content['USERNAME'], $content['PASSWORDHASH'] )
						);
						
						// Do the final redirect
						RedirectResult( GetAndReplaceLangStr( $content['LN_USER_ERROR_HASBEENADDED'], $content['USERNAME'] ) , "users.php" );
					}
				}
			}
			else if ( $_POST['op'] == "edituser" )
			{
				$euid  = (int) $content['USERID'];
				$result = DB_QueryBound( "SELECT ID FROM " . STATS_USERS . " WHERE ID = ?", 'i', array( $euid ) );
				$myrow = DB_GetSingleRow( $result, true );
				if ( !isset($myrow['ID']) )
				{
					$content['ISERROR'] = "true";
					$content['ERROR_MSG'] = GetAndReplaceLangStr( $content['LN_USER_ERROR_IDNOTFOUND'], $content['USERID'] ); 
				}
				else
				{

					// Check if Password is enabled
					if ( isset($content['PASSWORD1']) && strlen($content['PASSWORD1']) > 0 )
					{
						if ( $content['PASSWORD1'] != $content['PASSWORD2'] )
						{
							$content['ISERROR'] = "true";
							$content['ERROR_MSG'] = $content['LN_USER_ERROR_PASSSHORT'];
						}

						if ( !isset($content['ISERROR']) ) 
						{
							$content['PASSWORDHASH'] = UltraStats_HashUserPassword( $content['PASSWORD1'] );

							// Edit the User now!
							DB_ExecBound(
								"UPDATE " . STATS_USERS . " SET username = ?, password = ? WHERE ID = ?",
								'ssi',
								array( $content['USERNAME'], $content['PASSWORDHASH'], $euid )
							);
						}
					}
					else
					{
						// Edit the User now!
						DB_ExecBound(
							"UPDATE " . STATS_USERS . " SET username = ? WHERE ID = ?",
							'si',
							array( $content['USERNAME'], $euid )
						);
					}

					// Done redirect!
					RedirectResult( GetAndReplaceLangStr( $content['LN_USER_ERROR_HASBEENEDIT'], $content['USERNAME']) , "users.php" );
				}
			}
		}
	}
}
else
{
	// Default Mode = List Users
	$content['LISTUSERS'] = "true";

	// Read all Serverentries
	$sqlquery = "SELECT ID, " . 
				" username " . 
				" FROM " . STATS_USERS . 
				" ORDER BY ID ";
	$result = DB_Query($sqlquery);
	$content['USERS'] = DB_GetAllRows($result, true);

	// --- For the eye
	for($i = 0; $i < count($content['USERS']); $i++)
	{
		// --- Set CSS Class
		if ( $i % 2 == 0 )
			$content['USERS'][$i]['cssclass'] = "line1";
		else
			$content['USERS'][$i]['cssclass'] = "line2";
		// --- 
	}
	// --- 
}

// --- END Custom Code

if ( isset( $content['ISERROR'] ) && $content['ISERROR'] === 'true' && isset( $content['ERROR_MSG'] ) ) {
	$content['ERROR_MSG'] = UltraStats_h( $content['ERROR_MSG'] );
}

// --- Parsen and Output
InitTemplateParser();
$page -> parser($content, "admin/users.html");
$page -> output(); 
// --- 

?>