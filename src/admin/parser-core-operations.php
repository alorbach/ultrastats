<?php
/**
 * Shared admin parser request handling for `parser-core.php` (HTML) and `parser-sse.php` (EventSource).
 *
 * @package UltraStats
 */
if ( ! defined( 'IN_ULTRASTATS' ) ) {
	die( 'Hacking attempt' );
}

/**
 * Optional link / SSE hint after `updatestats` completes without an intermediate reload.
 */
function ParserCore_MaybePrintRunTotalsPrompt() {
	global $content;

	if ( defined( 'RELOADPARSER' ) ) {
		return;
	}
	if ( defined( 'IS_PARSER_SSE' ) && IS_PARSER_SSE ) {
		if ( function_exists( 'UltraStats_ParserSseEmitEvent' ) ) {
			UltraStats_ParserSseEmitEvent(
				'runtotals_next',
				array(
					'url'       => 'parser-sse.php?op=runtotals',
					'delayMs'   => 10000,
					'label'     => isset( $content['LN_RUNTOTALUPDATE'] ) ? $content['LN_RUNTOTALUPDATE'] : 'Run total update',
					'basepath'  => isset( $content['BASEPATH'] ) ? $content['BASEPATH'] : './../',
				)
			);
		}
		return;
	}
	print( '<br><center><a href="parser-core.php?op=runtotals"><img src="' . $content['BASEPATH'] . 'images/icons/gears_run.png">&nbsp; ' . $content['LN_RUNTOTALUPDATE'] . '</a></center>' );
	print(
		'<center><B>Automatically running ' . $content['LN_RUNTOTALUPDATE'] . ' in 10 seconds.</B><br>
			<script>function usParserReloadToTotals() { location.replace("parser-core.php?op=runtotals"); } setTimeout(usParserReloadToTotals, 10000);</script>'
	);
}

/**
 * Main router: same behavior as legacy `parser-core.php` body.
 */
function ParserCore_RunAdminRequest() {
	global $content, $ParserStart, $myserver;

	if ( isset( $_GET['op'] ) ) {
		$parseroperation = DB_RemoveBadChars( $_GET['op'] );
	} else {
		$parseroperation = '';
	}

	if ( isset( $_GET['op'] ) ) {
		if ( isset( $_GET['id'] ) && is_numeric( $_GET['id'] ) ) {
			$serverid = (int) DB_RemoveBadChars( $_GET['id'] );

			$result         = DB_QueryBound( 'SELECT * FROM ' . STATS_SERVERS . ' WHERE ID = ?', 'i', array( $serverid ) );
			$serverdetails  = DB_GetAllRows( $result, true );

			if ( ! empty( $serverdetails ) ) {
				$myserver    = $serverdetails[0];
				$ParserStart = microtime_float();

				CreateHTMLHeader();
				SetMaxExecutionTime();

				if ( $parseroperation === 'updatestats' ) {
					RunParserNow();
					ParserCore_MaybePrintRunTotalsPrompt();
				} elseif ( $parseroperation === 'delete' ) {
					DeleteServer();
				} elseif ( $parseroperation === 'deletestats' ) {
					DeleteServerStats();
				} elseif ( $parseroperation === 'resetlastlogline' ) {
					ResetLastLine();
				} elseif ( $parseroperation === 'getnewlogfile' ) {
					GetLastLogFile();
				} elseif ( $parseroperation === 'createaliases' ) {
					CreateTopAliases( $myserver['ID'] );
				} else {
					DieWithErrorMsg( "Error, empty or unknown Action specified - '" . $parseroperation . "'!" );
				}

				CreateHTMLFooter();
			} else {
				DieWithErrorMsg( "Error, Server with ID '$serverid' not found in database" );
			}
		} elseif (
			$parseroperation === 'runtotals' ||
			$parseroperation === 'createaliases' ||
			$parseroperation === 'calcmedalsonly' ||
			$parseroperation === 'calcdamagetypekills' ||
			$parseroperation === 'calcweaponkills' ||
			$parseroperation === 'databaseopt'
		) {
			$ParserStart = microtime_float();

			CreateHTMLHeader();
			SetMaxExecutionTime();

			if ( $parseroperation === 'runtotals' ) {
				RunTotalStats();
			} elseif ( $parseroperation === 'createaliases' ) {
				$ParserStart = microtime_float();
				ReCreateAliases();
			} elseif ( $parseroperation === 'calcmedalsonly' ) {
				$ParserStart = microtime_float();
				CreateAllMedals( -1 );
			} elseif ( $parseroperation === 'calcdamagetypekills' ) {
				RunDamagetypeKillsConsolidation( -1 );
			} elseif ( $parseroperation === 'calcweaponkills' ) {
				RunWeaponKillsConsolidation( -1 );
			} elseif ( $parseroperation === 'databaseopt' ) {
				OptimizeAllTables();
			}

			CreateHTMLFooter();
		} else {
			DieWithErrorMsg( 'Error, no or invalid Server ID given' );
		}
	}
}
