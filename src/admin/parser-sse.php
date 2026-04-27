<?php
/**
 * Admin parser output as Server-Sent Events (append-only log in the parent page).
 *
 * @package UltraStats
 */
define( 'IN_ULTRASTATS', true );
define( 'IS_PARSER_SSE', true );

$gl_root_path = './../';
require_once $gl_root_path . 'include/functions_common.php';

define( 'IS_ADMINPAGE', true );
$content['IS_ADMINPAGE'] = true;

define( 'IS_PARSERPAGE', true );
$content['IS_PARSERPAGE'] = true;

InitUltraStats();
CheckForUserLogin( false );
IncludeLanguageFile( $gl_root_path . 'lang/' . $LANG . '/admin.php' );

require_once $gl_root_path . 'include/functions_parser.php';
require_once $gl_root_path . 'include/functions_parser-helpers.php';
require_once $gl_root_path . 'include/functions_parser-medals.php';
require_once $gl_root_path . 'include/functions_parser-consolidation.php';

require_once __DIR__ . '/parser-core-operations.php';

UltraStats_ParserSseSendHeaders();

ParserCore_RunAdminRequest();
