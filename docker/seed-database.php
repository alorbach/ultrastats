#!/usr/bin/env php
<?php
/**
 * Docker dev: apply SQL the same way as install.php step 5 (db_template + game-specific file + config rows).
 * Replaces the brittle "pipe SQL to mysql" init when tables are missing or partial (e.g. Windows CRLF).
 *
 * Env: ULTRASTATS_HOME (default /var/www/html), ULTRASTATS_DB_*, ULTRASTATS_TBPREF, ULTRASTATS_NUKE_PARTIAL (default 1)
 */
define( 'IN_ULTRASTATS', true );

$base = rtrim( getenv( 'ULTRASTATS_HOME' ) ?: '/var/www/html', "/\\" ) . DIRECTORY_SEPARATOR;
require_once $base . 'include/functions_db.php';

$host   = getenv( 'ULTRASTATS_DB_HOST' ) ?: 'db';
$port   = (int) ( getenv( 'ULTRASTATS_DB_PORT' ) ?: 3306 );
$dbname = getenv( 'ULTRASTATS_DB_NAME' ) ?: 'ultrastats';
$user   = getenv( 'ULTRASTATS_DB_USER' ) ?: 'ultrastats';
$pass   = getenv( 'ULTRASTATS_DB_PASS' ) ?: 'ultrastats';
$prefix = getenv( 'ULTRASTATS_TBPREF' ) ?: 'stats_';
$nuke   = getenv( 'ULTRASTATS_NUKE_PARTIAL' );
if ( $nuke === false || $nuke === '' ) {
	$nuke = '1';
}

$internalDbVer = '8';
$genGameVer    = 4; // CODWW, same as install default in step 3

/**
 * Same line filter as install.php ImportDataFile: skip full-line SQL comments.
 */
function ultrastats_read_sql_file( $path ) {
	$out = '';
	$h   = @fopen( $path, 'r' );
	if ( ! $h ) {
		fwrite( STDERR, "seed-database: cannot read {$path}\n" );
		return false;
	}
	while ( ! feof( $h ) ) {
		$buffer = fgets( $h, 4096 );
		if ( $buffer === false ) {
			break;
		}
		$pos = strpos( $buffer, '--' );
		if ( $pos === false ) {
			$out .= $buffer;
		} elseif ( $pos > 2 && strlen( trim( $buffer ) ) > 1 ) {
			$out .= $buffer;
		}
	}
	fclose( $h );
	return $out;
}

$m = @mysqli_connect( $host, $user, $pass, $dbname, $port );
if ( ! $m || mysqli_connect_errno() ) {
	fwrite( STDERR, 'seed-database: ' . mysqli_connect_error() . "\n" );
	exit( 1 );
}
mysqli_set_charset( $m, 'utf8' );

$tnWeapons = $prefix . 'weapons';
$escDb     = mysqli_real_escape_string( $m, $dbname );
$escTbl    = mysqli_real_escape_string( $m, $tnWeapons );
$qExist    = "SELECT 1 FROM information_schema.tables WHERE table_schema = '{$escDb}' AND table_name = '{$escTbl}' LIMIT 1";
$chk       = @mysqli_query( $m, $qExist );
if ( $chk && mysqli_num_rows( $chk ) > 0 ) {
	fwrite( STDOUT, "seed-database: table {$tnWeapons} already present, nothing to do.\n" );
	exit( 0 );
}

$tnConfig = $prefix . 'config';
$escCfg   = mysqli_real_escape_string( $m, $tnConfig );
$qCfg     = "SELECT 1 FROM information_schema.tables WHERE table_schema = '{$escDb}' AND table_name = '{$escCfg}' LIMIT 1";
$chk2     = @mysqli_query( $m, $qCfg );
if ( ( $chk2 && mysqli_num_rows( $chk2 ) > 0 ) && in_array( $nuke, array( '1', 'true', 'yes' ), true ) ) {
	fwrite( STDOUT, "seed-database: partial/empty schema detected, dropping all `{$prefix}%` tables for clean re-import...\n" );
	$escdb  = mysqli_real_escape_string( $m, $dbname );
	$like   = str_replace( '_', '\_', $prefix ) . '%';
	$escpre = mysqli_real_escape_string( $m, $like );
	$rs     = @mysqli_query( $m, "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = '{$escdb}' AND TABLE_NAME LIKE '{$escpre}'" );
	if ( $rs ) {
		mysqli_query( $m, 'SET FOREIGN_KEY_CHECKS=0' );
		while ( $row = mysqli_fetch_row( $rs ) ) {
			$t = $row[0];
			$et = mysqli_real_escape_string( $m, $t );
			if ( @mysqli_query( $m, "DROP TABLE IF EXISTS `{$et}`" ) ) {
				fwrite( STDOUT, "  dropped: {$t}\n" );
			}
		}
		mysqli_query( $m, 'SET FOREIGN_KEY_CHECKS=1' );
	}
}

$total = '';
$main  = ultrastats_read_sql_file( $base . 'contrib/db_template.txt' );
if ( $main === false ) {
	exit( 1 );
}
$total .= $main;

$ww = ultrastats_read_sql_file( $base . 'contrib/db_template_codwwonly.txt' );
if ( $ww === false ) {
	exit( 1 );
}
$total .= $ww;

$total = str_replace( '`stats_', '`' . $prefix, $total );
$total = preg_replace( '/\r\n|\r/', "\n", $total );
$total = preg_replace( '/TYPE=MyISAM/i', 'ENGINE=MyISAM', $total );

$stmts   = UltraStats_SplitSqlStatements( $total );
$stmts[] = "INSERT INTO `{$prefix}config` (`name`, `value`) VALUES ('gen_gameversion', '{$genGameVer}')";
$stmts[] = "INSERT INTO `{$prefix}config` (`name`, `value`) VALUES ('database_installedversion', '{$internalDbVer}')";

$ok  = 0;
$err = 0;
foreach ( $stmts as $sql ) {
	if ( strlen( trim( $sql ) ) < 2 ) {
		continue;
	}
	if ( ! @mysqli_query( $m, $sql ) ) {
		fwrite( STDERR, "seed-database: ERROR: " . mysqli_error( $m ) . "\n" );
		fwrite( STDERR, substr( $sql, 0, 200 ) . "...\n" );
		$err++;
	} else {
		$ok++;
	}
}
mysqli_close( $m );

if ( $err > 0 ) {
	fwrite( STDERR, "seed-database: {$err} failed, {$ok} ok.\n" );
	exit( 1 );
}
fwrite( STDOUT, "seed-database: applied " . ( count( $stmts ) ) . " statement(s) ({$ok} successful).\n" );
exit( 0 );
