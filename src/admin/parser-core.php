<?php
/**
 * Core parser entry (CLI or included from `parser.php`). After bootstrap, `RunParsingProcess*`
 * functions load gamelogs and invoke `functions_parser.php` to populate the DB.
 * @package UltraStats
 */
/*
	********************************************************************
	* ->	Parser Core File
	*		This file actually calls the parser
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

// Set PARSERPAGE to true!
define('IS_PARSERPAGE', true);
$content['IS_PARSERPAGE'] = true;

InitUltraStats();
CheckForUserLogin( false );
IncludeLanguageFile( $gl_root_path . 'lang/' . $LANG . '/admin.php' );
// ***					*** //

// --- BEGIN Custom Code
// Additional Includes
require_once($gl_root_path . 'include/functions_parser.php');
require_once($gl_root_path . 'include/functions_parser-helpers.php');
require_once($gl_root_path . 'include/functions_parser-medals.php');
require_once($gl_root_path . 'include/functions_parser-consolidation.php');

require_once __DIR__ . '/parser-core-operations.php';

ParserCore_RunAdminRequest();
// --- 

?>
