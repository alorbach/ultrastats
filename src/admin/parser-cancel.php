<?php
/**
 * Set a cooperative "cancel parse" flag for the given server (used with the embedded SSE parser).
 * The running `updatestats` parse checks the flag at safe points and stops.
 *
 * @package UltraStats
 */
define( 'IN_ULTRASTATS', true );
$gl_root_path = './../';
require_once $gl_root_path . 'include/functions_common.php';

define( 'IS_ADMINPAGE', true );
$content['IS_ADMINPAGE'] = true;

InitUltraStats();
CheckForUserLogin( false );

if ( function_exists( 'session_status' ) && session_status() === PHP_SESSION_ACTIVE ) {
	@session_write_close();
}

header( 'Content-Type: application/json; charset=utf-8' );

$serverid = 0;
if ( isset( $_GET['id'] ) && is_numeric( $_GET['id'] ) ) {
	$serverid = (int) DB_RemoveBadChars( $_GET['id'] );
} elseif ( isset( $_POST['id'] ) && is_numeric( $_POST['id'] ) ) {
	$serverid = (int) DB_RemoveBadChars( $_POST['id'] );
}

if ( $serverid <= 0 ) {
	echo json_encode( array( 'ok' => false, 'error' => 'Invalid server id' ) );
	exit;
}

require_once $gl_root_path . 'include/functions_parser-helpers.php';

$ok = UltraStats_ParserCancelRequest( $serverid );
echo json_encode( array( 'ok' => $ok ) );
exit;
