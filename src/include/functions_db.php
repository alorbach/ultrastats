<?php
/*
	********************************************************************
	* Copyright by Andre Lorbach | 2006-2026
	* -> https://alorbach.github.io/ultrastats <-
	* ------------------------------------------------------------------
	* ->	DB Functions File
	*		Database helper functions (mysqli)
	* This file is part of UltraStats
	* UltraStats is free software: you can redistribute it and/or modify
	* it under the terms of the GNU General Public License as published
	* by the Free Software Foundation, either version 3 of the License,
	* or (at your option) any later version.
	********************************************************************
*/

if ( !defined('IN_ULTRASTATS') )
{
	die('Hacking attempt');
	exit;
}

/** @var mysqli|null */
$link_id  = null;
$querycount = 0;
$errdesc = "";
$errno = 0;

$content['database_internalversion'] = "15";
$content['database_installedversion'] = "0";

/**
 * One-time SQL split: legacy files used split(";\n") for multi-statement scripts.
 * Returns non-empty statement chunks (trimmed, without trailing semicolons in chunk).
 *
 * Prepared statement entry points: DB_QueryBound, DB_ExecBound, DB_StatementBindParams,
 * UltraStats_SqlLikeContainsPattern (require mysqlnd for SELECTs returning mysqli_result).
 */
function UltraStats_SplitSqlStatements( $sql )
{
	$sql = str_replace( array( ";\r\n", ";\r" ), ";\n", $sql );
	$parts = explode( ";\n", $sql );
	$out   = array();
	foreach ( $parts as $p ) {
		$p = trim( $p );
		if ( strlen( $p ) > 1 ) {
			$out[] = $p;
		}
	}
	return $out;
}

/**
 * Allow only safe MySQL identifier fragments for custom table prefix (alphanumeric, underscore).
 */
function UltraStats_ValidateTablePrefix( $p ) {
	$s = is_string( $p ) ? $p : 'stats_';
	if ( preg_match( '/^[A-Za-z0-9_]+$/', $s ) ) {
		return $s;
	}
	return 'stats_';
}

/**
 * Normalizes a MySQL table storage engine to InnoDB or MyISAM, or null if invalid.
 */
function UltraStats_NormalizeStorageEngine( $engine ) {
	if ( ! is_string( $engine ) || $engine === '' ) {
		return null;
	}
	$e = strtoupper( trim( $engine ) );
	if ( $e === 'INNODB' ) {
		return 'InnoDB';
	}
	if ( $e === 'MYISAM' ) {
		return 'MyISAM';
	}
	return null;
}

/**
 * Replaces legacy TYPE=MyISAM in schema SQL with ENGINE=<InnoDB|MyISAM> (install, Docker seed, etc.).
 */
function UltraStats_ApplyStorageEngineToSchemaSql( $sql, $engine ) {
	$norm = UltraStats_NormalizeStorageEngine( $engine );
	if ( $norm === null ) {
		$norm = 'InnoDB';
	}
	return (string) preg_replace( '/\bTYPE=MyISAM\b/i', 'ENGINE=' . $norm, (string) $sql );
}

function DB_Connect()
{
	global $link_id, $CFG;

	$port = isset( $CFG['Port'] ) ? (int) $CFG['Port'] : 3306;
	$link_id = @mysqli_connect( $CFG['DBServer'], $CFG['User'], $CFG['Pass'], $CFG['DBName'], $port );
	if ( ! $link_id || mysqli_connect_errno() ) {
		$err = mysqli_connect_error();
		if ( $err ) {
			$errdesc = $err;
		}
		DB_PrintError( "Link-ID == false, connect to " . $CFG['DBServer'] . " failed", true );
	}

	$strmysqlver = mysqli_get_server_info( $link_id );
	if ( strpos( $strmysqlver, "-" ) !== false ) {
		$sttmp     = explode( "-", $strmysqlver );
		$szVerInfo = $sttmp[0];
	} else
		$szVerInfo = $strmysqlver;

	$szVerSplit = explode( ".", $szVerInfo );

	if ( (int) $szVerSplit[0] <= 3 ) {
		DieWithFriendlyErrorMsg( "You are running an MySQL 3.x Database Server Version. Unfortunately MySQL 3.x is NOT supported by UltraStats due the limited SQL Statement support. If this is a commercial webspace, contact your webhoster in order to upgrade to a higher MySQL Database Version. If this is your own rootserver, consider updating your MySQL Server." );
	}

	// Schema SQL in contrib/*.txt uses legacy 8-bit strings; latin1 matches install/seed (see docker/seed-database.php).
	// Normal runtime uses utf8mb4 for chat and full Unicode.
	if ( defined( 'IN_ULTRASTATS_INSTALL' ) && IN_ULTRASTATS_INSTALL ) {
		@mysqli_set_charset( $link_id, 'latin1' );
	} else {
		@mysqli_set_charset( $link_id, 'utf8mb4' );
	}
}

function EnableBigSelects()
{
	global $link_id;
	@mysqli_query( $link_id, "SET SESSION sql_big_selects=1" );
}

function DB_Disconnect()
{
	global $link_id;
	if ( $link_id instanceof mysqli ) {
		mysqli_close( $link_id );
		$link_id = null;
	}
}

function DB_Query( $query_string, $bProcessError = true, $bCritical = false )
{
	global $link_id, $querycount;

	$query_id = false;
	try {
		$query_id = mysqli_query( $link_id, $query_string );
	} catch ( mysqli_sql_exception $e ) {
		// PHP 8.1+ mysqli default: SQL errors throw instead of returning false; match legacy behavior.
		$query_id = false;
	}
	if ( ! $query_id && $bProcessError ) {
		DB_PrintError( "Invalid SQL: " . $query_string, $bCritical );
	}

	$querycount++;

	return $query_id;
}

function DB_FreeQuery( $query_id )
{
	if ( $query_id instanceof mysqli_result ) {
		mysqli_free_result( $query_id );
	}
}

function DB_GetRow( $query_id )
{
	if ( ! $query_id || ! ( $query_id instanceof mysqli_result ) ) {
		return null;
	}
	$tmp = mysqli_fetch_row( $query_id );
	$results = array();
	$results[] = $tmp;
	return $results[0];
}

function DB_GetSingleRow( $query_id, $bClose )
{
	if ( $query_id && ( $query_id instanceof mysqli_result ) ) {
		$row = mysqli_fetch_array( $query_id, MYSQLI_ASSOC );

		if ( $bClose ) {
			DB_FreeQuery( $query_id );
		}

		if ( isset( $row ) ) {
			return $row;
		}
	}
}

function DB_GetAllRows( $query_id, $bClose )
{
	if ( $query_id && ( $query_id instanceof mysqli_result ) ) {
		$var = array();
		while ( $row  =  mysqli_fetch_array( $query_id, MYSQLI_ASSOC ) ) {
			$var[]  =  $row;
		}

		if ( $bClose ) {
			DB_FreeQuery( $query_id );
		}

		if ( isset( $var ) ) {
			return $var;
		}
	}
}

function DB_GetMysqlStats()
{
	global $link_id;
	$status = explode( '  ', mysqli_stat( $link_id ) );
	return $status;
}

function DB_ReturnSimpleErrorMsg()
{
	global $link_id;
	if ( $link_id instanceof mysqli && mysqli_errno( $link_id ) ) {
		return "MySQLi Error " . mysqli_errno( $link_id ) . " - Description: " . mysqli_error( $link_id );
	}
	$e = function_exists( 'mysqli_connect_error' ) ? mysqli_connect_error() : '';
	if ( $e ) {
		return "MySQLi connect error: " . $e;
	}
	return "MySQLi Error: (no link)";
}

function DB_PrintError( $MyErrorMsg, $DieOrNot )
{
	global $errdesc, $errno, $linesep, $link_id, $CFG;

	if ( $link_id instanceof mysqli ) {
		$errdesc = mysqli_error( $link_id );
		$errno   = mysqli_errno( $link_id );
	} else {
		$errdesc = function_exists( 'mysqli_connect_error' ) ? mysqli_connect_error() : '';
		$errno   = function_exists( 'mysqli_connect_errno' ) ? mysqli_connect_errno() : 0;
	}

	$errormsg = "Database error: $MyErrorMsg $linesep";
	$errormsg .= "mysqli error: $errdesc $linesep";
	$errormsg .= "mysqli error number: $errno $linesep";
	$errormsg .= "Date: " . date( "d.m.Y @ H:i" ) . $linesep;
	$errormsg .= "Script: " . getenv( "REQUEST_URI" ) . $linesep;
	$errormsg .= "Referer: " . getenv( "HTTP_REFERER" ) . $linesep;

	if ( $DieOrNot == true ) {
		DieWithErrorMsg( "$linesep" . $errormsg );
	} else
		echo $errormsg;
}

function DB_RemoveParserSpecialBadChars( $myString )
{
	$returnstr = str_replace( "'", "\\'", $myString );
	return $returnstr;
}

/**
 * String escaping for legacy concatenated SQL. Prefer prepared statements for new code.
 */
function DB_RemoveBadChars( $myString )
{
	return addslashes( (string) $myString );
}

/**
 * Coerce game-log text to valid UTF-8 for MySQL utf8mb3/utf8mb4. Logs are often Windows-1252 / Latin-1; invalid
 * multibyte sequences are stripped (iconv) or converted (mb) so INSERT does not fail with error 1366.
 *
 * @param string $s Raw substring from the log line
 * @return string
 */
function UltraStats_Utf8StringForDatabase( $s ) {
	$s = (string) $s;
	if ( $s === '' ) {
		return '';
	}
	if ( function_exists( 'mb_check_encoding' ) && mb_check_encoding( $s, 'UTF-8' ) ) {
		return $s;
	}
	if ( function_exists( 'mb_convert_encoding' ) ) {
		$u = @mb_convert_encoding( $s, 'UTF-8', 'Windows-1252' );
		if ( is_string( $u ) && ( ! function_exists( 'mb_check_encoding' ) || mb_check_encoding( $u, 'UTF-8' ) ) ) {
			return $u;
		}
	}
	if ( function_exists( 'mb_convert_encoding' ) ) {
		$u = @mb_convert_encoding( $s, 'UTF-8', 'ISO-8859-1' );
		if ( is_string( $u ) && ( ! function_exists( 'mb_check_encoding' ) || mb_check_encoding( $u, 'UTF-8' ) ) ) {
			return $u;
		}
	}
	if ( function_exists( 'iconv' ) ) {
		$u = @iconv( 'UTF-8', 'UTF-8//IGNORE', $s );
		if ( is_string( $u ) && $u !== false ) {
			return $u;
		}
	}
	return '';
}

function DB_StripSlahes( $myString )
{
	return stripslashes( (string) $myString );
}

function DB_GetRowCount( $query )
{
	global $link_id;

	$num_rows = -1;
	$result   = false;
	try {
		$result = mysqli_query( $link_id, $query );
	} catch ( mysqli_sql_exception $e ) {
		$result = false;
	}
	if ( $result ) {
		if ( $result instanceof mysqli_result ) {
			$num_rows = mysqli_num_rows( $result );
			mysqli_free_result( $result );
		}
	}
	return $num_rows;
}

/**
 * Run a SELECT with bound parameters and return mysqli_num_rows, or -1 on failure. Frees the result.
 */
function DB_GetRowCountBound( $sql, $types, array $params, $bProcessError = true, $bCritical = false ) {
	$result = DB_QueryBound( $sql, $types, $params, $bProcessError, $bCritical );
	if ( $result && ( $result instanceof mysqli_result ) ) {
		$num_rows = mysqli_num_rows( $result );
		mysqli_free_result( $result );
		return $num_rows;
	}
	return -1;
}

function DB_GetRowCountByResult( $myresult )
{
	if ( $myresult && ( $myresult instanceof mysqli_result ) ) {
		return mysqli_num_rows( $myresult );
	}
}

function DB_Exec( $query )
{
	global $link_id;
	try {
		if ( mysqli_query( $link_id, $query ) ) {
			return true;
		}
	} catch ( mysqli_sql_exception $e ) {
		// PHP 8.1+ can throw on SQL errors; match legacy false return
	}
	return false;
}

function WriteConfigValue( $szValue )
{
	global $content;

	$name  = DB_EscapeString( (string) $szValue );
	$value = isset( $content[ $szValue ] ) ? DB_EscapeString( (string) $content[ $szValue ] ) : '';
	$result = DB_Query( "SELECT name FROM " . STATS_CONFIG . " WHERE name = '" . $name . "'" );
	$rows   = DB_GetAllRows( $result, true );
	if ( $rows === null || ( is_array( $rows ) && count( $rows ) === 0 ) ) {
		$result = DB_Query( "INSERT INTO " . STATS_CONFIG . " (name, value) VALUES ( '" . $name . "', '" . $value . "')" );
		DB_FreeQuery( $result );
	} else {
		$result = DB_Query( "UPDATE " . STATS_CONFIG . " SET value = '" . $value . "' WHERE name = '" . $name . "'" );
		DB_FreeQuery( $result );
	}
}

function GetSingleDBEntryOnly( $myqry )
{
	$result = DB_Query( $myqry );
	$row    = DB_GetRow( $result );
	DB_FreeQuery( $result );

	if ( isset( $row ) ) {
		return $row[0];
	} else
		return -1;
}

function GetRowsAffected()
{
	global $link_id;
	return mysqli_affected_rows( $link_id );
}

/**
 * Escape value for use inside SQL string literals. Uses mysqli real_escape.
 */
function DB_EscapeString( $s )
{
	global $link_id;
	if ( ! ( $link_id instanceof mysqli ) ) {
		return addslashes( (string) $s );
	}
	return mysqli_real_escape_string( $link_id, (string) $s );
}

/**
 * Build a value for `LIKE ?` (contains search): escapes LIKE metacharacters, wraps with %.
 * Use with mysqli prepared statements only — not for string-concatenated SQL.
 */
function UltraStats_SqlLikeContainsPattern( $fragment ) {
	$s = (string) $fragment;
	$s = str_replace( array( '\\', '%', '_' ), array( '\\\\', '\\%', '\\_' ), $s );
	return '%' . $s . '%';
}

/**
 * Bind parameters for mysqli_stmt. $types e.g. "iss"; $params is a zero-indexed list.
 */
function DB_StatementBindParams( mysqli_stmt $stmt, $types, array $params ) {
	$bind = array( (string) $types );
	$n    = count( $params );
	for ( $i = 0; $i < $n; $i++ ) {
		$bind[] = &$params[ $i ];
	}
	return call_user_func_array( array( $stmt, 'bind_param' ), $bind );
}

/**
 * Run a SELECT (or any statement that returns a result set) with bound parameters.
 * Requires the mysqlnd driver (mysqli_stmt_get_result). Closes the statement; returns a mysqli result or false.
 *
 * @param string $types Parameter types for mysqli::bind_param (e.g. "is").
 * @return mysqli_result|bool
 */
function DB_QueryBound( $sql, $types, array $params, $bProcessError = true, $bCritical = false ) {
	global $link_id, $querycount;

	if ( ! function_exists( 'mysqli_stmt_get_result' ) ) {
		if ( $bProcessError ) {
			DB_PrintError( 'DB_QueryBound requires mysqlnd (mysqli_stmt_get_result). SQL: ' . $sql, $bCritical );
		}
		return false;
	}
	if ( ! ( $link_id instanceof mysqli ) ) {
		if ( $bProcessError ) {
			DB_PrintError( 'DB_QueryBound: no database link. SQL: ' . $sql, $bCritical );
		}
		return false;
	}

	$stmt = mysqli_prepare( $link_id, $sql );
	if ( ! $stmt ) {
		if ( $bProcessError ) {
			DB_PrintError( 'Prepare failed: ' . $sql, $bCritical );
		}
		return false;
	}

	$nt = strlen( (string) $types );
	$na = count( $params );
	if ( $nt !== $na ) {
		mysqli_stmt_close( $stmt );
		if ( $bProcessError ) {
			DB_PrintError( "DB_QueryBound: types length ($nt) != param count ($na) for: " . $sql, $bCritical );
		}
		return false;
	}

	if ( $nt > 0 ) {
		if ( ! DB_StatementBindParams( $stmt, $types, $params ) ) {
			mysqli_stmt_close( $stmt );
			if ( $bProcessError ) {
				DB_PrintError( 'bind_param failed: ' . $sql, $bCritical );
			}
			return false;
		}
	}

	if ( ! mysqli_stmt_execute( $stmt ) ) {
		mysqli_stmt_close( $stmt );
		if ( $bProcessError ) {
			DB_PrintError( 'Execute failed: ' . $sql, $bCritical );
		}
		return false;
	}

	$rs = mysqli_stmt_get_result( $stmt );
	mysqli_stmt_close( $stmt );
	$querycount++;
	return $rs;
}

/**
 * Run INSERT, UPDATE, or DELETE with bound parameters (no result set). Returns true on success.
 */
function DB_ExecBound( $sql, $types, array $params, $bProcessError = true, $bCritical = false ) {
	global $link_id, $querycount;

	if ( ! ( $link_id instanceof mysqli ) ) {
		if ( $bProcessError ) {
			DB_PrintError( 'DB_ExecBound: no database link. SQL: ' . $sql, $bCritical );
		}
		return false;
	}

	$stmt = mysqli_prepare( $link_id, $sql );
	if ( ! $stmt ) {
		if ( $bProcessError ) {
			DB_PrintError( 'Prepare failed: ' . $sql, $bCritical );
		}
		return false;
	}

	$nt = strlen( (string) $types );
	$na = count( $params );
	if ( $nt !== $na ) {
		mysqli_stmt_close( $stmt );
		if ( $bProcessError ) {
			DB_PrintError( "DB_ExecBound: types length ($nt) != param count ($na) for: " . $sql, $bCritical );
		}
		return false;
	}

	if ( $nt > 0 ) {
		if ( ! DB_StatementBindParams( $stmt, $types, $params ) ) {
			mysqli_stmt_close( $stmt );
			if ( $bProcessError ) {
				DB_PrintError( 'bind_param failed: ' . $sql, $bCritical );
			}
			return false;
		}
	}

	$ok = mysqli_stmt_execute( $stmt );
	mysqli_stmt_close( $stmt );
	if ( ! $ok ) {
		if ( $bProcessError ) {
			DB_PrintError( 'Execute failed: ' . $sql, $bCritical );
		}
		return false;
	}
	$querycount++;
	return true;
}

?>
