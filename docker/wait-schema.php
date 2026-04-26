<?php
/**
 * Wait until base schema is usable: `stats_weapons` must exist (avoids false positive from
 * `SHOW TABLES LIKE 'stats_config'` where `_` is a single-char wildcard in MySQL LIKE).
 */
$h = getenv('ULTRASTATS_DB_HOST') ?: 'db';
$u = getenv('ULTRASTATS_DB_USER') ?: 'ultrastats';
$p = getenv('ULTRASTATS_DB_PASS') ?: 'ultrastats';
$d = getenv('ULTRASTATS_DB_NAME') ?: 'ultrastats';
$port = (int) (getenv('ULTRASTATS_DB_PORT') ?: 3306);
$prefix = getenv('ULTRASTATS_TBPREF') ?: 'stats_';
$table  = $prefix . 'weapons';

for ($i = 0; $i < 120; $i++) {
	$m = @mysqli_connect( $h, $u, $p, $d, $port );
	if ( $m ) {
		$tn = mysqli_real_escape_string( $m, $table );
		$ds = mysqli_real_escape_string( $m, $d );
		$q  = "SELECT 1 FROM information_schema.tables WHERE table_schema = '{$ds}' AND table_name = '{$tn}' LIMIT 1";
		$r  = @mysqli_query( $m, $q );
		if ( $r && mysqli_num_rows( $r ) > 0 ) {
			exit( 0 );
		}
	}
	sleep( 1 );
}
fwrite( STDERR, "wait-schema: timeout waiting for table {$table}\n" );
exit( 1 );
