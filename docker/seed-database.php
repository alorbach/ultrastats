#!/usr/bin/env php
<?php
/**
 * Docker dev: apply SQL the same way as install.php step 5 (db_template + game-specific file + config rows).
 * Replaces the brittle "pipe SQL to mysql" init when tables are missing or partial (e.g. Windows CRLF).
 *
 * Default game: Call of Duty 4 (COD4) with db_template_cod4only.txt — matches docker dev sample logs under gamelogs/.
 * If MySQL init (01-import.sh) already created tables without gen_gameversion, nuke+reimport (ULTRASTATS_NUKE_PARTIAL).
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

$internalDbVer = $content['database_internalversion'];
$genGameVer    = 3; // COD4 — see functions_constants.php (COD4)

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

/**
 * @param mysqli   $m
 * @param string   $db
 * @param string   $name unescaped table name
 */
function ultrastats_table_exists( $m, $db, $name ) {
	$eDb  = mysqli_real_escape_string( $m, $db );
	$eTbl = mysqli_real_escape_string( $m, $name );
	$q    = "SELECT 1 FROM information_schema.tables WHERE table_schema = '{$eDb}' AND table_name = '{$eTbl}' LIMIT 1";
	$r    = @mysqli_query( $m, $q );
	return ( $r && mysqli_num_rows( $r ) > 0 );
}

$m = @mysqli_connect( $host, $user, $pass, $dbname, $port );
if ( ! $m || mysqli_connect_errno() ) {
	fwrite( STDERR, 'seed-database: ' . mysqli_connect_error() . "\n" );
	exit( 1 );
}
// Project SQL files use legacy 8-bit characters in language strings; latin1 matches typical install environments.
mysqli_set_charset( $m, 'latin1' );

$tnWeapons  = $prefix . 'weapons';
$escDb      = mysqli_real_escape_string( $m, $dbname );
$expectedGv = (string) (int) $genGameVer;

$haveWeapons = ultrastats_table_exists( $m, $dbname, $tnWeapons );
$curGv       = null;
$cfgTable    = $prefix . 'config';
if ( ultrastats_table_exists( $m, $dbname, $cfgTable ) ) {
	$eGv  = mysqli_real_escape_string( $m, 'gen_gameversion' );
	$rGv  = @mysqli_query( $m, "SELECT `value` FROM `{$cfgTable}` WHERE `name` = '{$eGv}' LIMIT 1" );
	if ( $rGv && ( $rowGv = mysqli_fetch_row( $rGv ) ) ) {
		$curGv = (string) $rowGv[0];
	}
}

if ( $haveWeapons && $curGv === $expectedGv ) {
	fwrite( STDOUT, "seed-database: gen_gameversion {$curGv} already applied, nothing to do.\n" );
	mysqli_close( $m );
	exit( 0 );
}

$needNuke = $haveWeapons && ( $curGv !== $expectedGv );

if ( $needNuke || ( ! $haveWeapons && ultrastats_table_exists( $m, $dbname, $cfgTable ) && in_array( $nuke, array( '1', 'true', 'yes' ), true ) ) ) {
	if ( ! in_array( $nuke, array( '1', 'true', 'yes' ), true ) ) {
		fwrite( STDERR, "seed-database: existing schema is not CoD4 (gen_gameversion={$expectedGv}); set ULTRASTATS_NUKE_PARTIAL=1 or run: docker compose -f docker/docker-compose.yml down -v\n" );
		mysqli_close( $m );
		exit( 1 );
	}
	fwrite( STDOUT, "seed-database: replacing schema (gen_gameversion was " . ( $curGv === null ? 'unset' : $curGv ) . ", target {$expectedGv})...\n" );
	$escdb  = mysqli_real_escape_string( $m, $dbname );
	$like   = str_replace( '_', '\_', $prefix ) . '%';
	$escpre = mysqli_real_escape_string( $m, $like );
	$rs     = @mysqli_query( $m, "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = '{$escdb}' AND TABLE_NAME LIKE '{$escpre}'" );
	if ( $rs ) {
		mysqli_query( $m, 'SET FOREIGN_KEY_CHECKS=0' );
		while ( $row = mysqli_fetch_row( $rs ) ) {
			$t  = $row[0];
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
	mysqli_close( $m );
	exit( 1 );
}
$total .= $main;

$cod4 = ultrastats_read_sql_file( $base . 'contrib/db_template_cod4only.txt' );
if ( $cod4 === false ) {
	mysqli_close( $m );
	exit( 1 );
}
$total .= $cod4;

$total = str_replace( '`stats_', '`' . $prefix, $total );
$total = preg_replace( '/\r\n|\r/', "\n", $total );
$envStorageEngine = getenv( 'ULTRASTATS_DB_STORAGE_ENGINE' );
if ( $envStorageEngine === false || $envStorageEngine === '' ) {
	$envStorageEngine = 'InnoDB';
}
$seNorm = UltraStats_NormalizeStorageEngine( $envStorageEngine );
$total  = UltraStats_ApplyStorageEngineToSchemaSql( $total, $seNorm !== null ? $seNorm : 'InnoDB' );

$stmts   = UltraStats_SplitSqlStatements( $total );
$stmts[] = "INSERT INTO `{$prefix}config` (`name`, `value`) VALUES ('gen_gameversion', '{$genGameVer}')";
$stmts[] = "INSERT INTO `{$prefix}config` (`name`, `value`) VALUES ('database_installedversion', '{$internalDbVer}')";

// Sample servers for dev gamelogs (paths relative to document root /var/www/html).
$sn1  = mysqli_real_escape_string( $m, 'Dev CoD4 (normal)' );
$sn2  = mysqli_real_escape_string( $m, 'Dev CoD4 (HQ new)' );
$sd1  = mysqli_real_escape_string( $m, 'Docker dev: sample cod4_normal.log' );
$sd2  = mysqli_real_escape_string( $m, 'Docker dev: sample cod4_hq_new.log' );
$gl1  = mysqli_real_escape_string( $m, 'gamelogs/cod4_normal.log' );
$gl2  = mysqli_real_escape_string( $m, 'gamelogs/cod4_hq_new.log' );
$stmts[] = "INSERT INTO `{$prefix}servers` (`Name`, `IP`, `Port`, `Description`, `ModName`, `AdminName`, `AdminEmail`, `ClanName`, `GameLogLocation`, `ftppath`, `ServerLogo`, `ServerEnabled`, `ParsingEnabled`, `FTPPassiveMode`) VALUES " .
	"('{$sn1}', '127.0.0.1', 0, '{$sd1}', '', '', '', '', '{$gl1}', '', '', 1, 1, 0), " .
	"('{$sn2}', '127.0.0.1', 0, '{$sd2}', '', '', '', '', '{$gl2}', '', '', 1, 1, 0)";

// Default web admin for local Docker only (same algorithm as functions_users CreateUserName).
$adminName = mysqli_real_escape_string( $m, 'admin' );
$adminHash = mysqli_real_escape_string( $m, password_hash( 'pass', PASSWORD_DEFAULT ) );
$stmts[]   = "INSERT INTO `{$prefix}users` (`username`, `password`, `access_level`) VALUES ('{$adminName}', '{$adminHash}', 0)";

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
