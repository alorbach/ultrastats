<?php
/**
 * PHPUnit bootstrap: pure helpers from functions_db.php only (no DB connection).
 */
define( 'IN_ULTRASTATS', true );
$gl_root_path = dirname( __DIR__ ) . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR;
require_once $gl_root_path . 'include/functions_db.php';
