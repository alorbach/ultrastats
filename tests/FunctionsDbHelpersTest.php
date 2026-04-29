<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * Tests for stateless SQL helpers (no mysqli).
 */
final class FunctionsDbHelpersTest extends TestCase {

	public function testSplitSqlStatements_basic(): void {
		$sql = "SELECT 1;\nSELECT 2;\n";
		$out = UltraStats_SplitSqlStatements( $sql );
		$this->assertSame( array( 'SELECT 1', 'SELECT 2' ), $out );
	}

	public function testSplitSqlStatements_crlf(): void {
		$sql = "UPDATE t SET a=1;\r\nUPDATE t SET b=2;";
		$out = UltraStats_SplitSqlStatements( $sql );
		$this->assertCount( 2, $out );
		$this->assertStringContainsString( 'a=1', $out[0] );
		$this->assertStringContainsString( 'b=2', $out[1] );
	}

	public function testValidateTablePrefix(): void {
		$this->assertSame( 'stats_', UltraStats_ValidateTablePrefix( 'stats_' ) );
		$this->assertSame( 'us_', UltraStats_ValidateTablePrefix( 'us_' ) );
		$this->assertSame( 'stats_', UltraStats_ValidateTablePrefix( "stats_; DROP" ) );
		$this->assertSame( 'stats_', UltraStats_ValidateTablePrefix( '' ) );
	}

	public function testNormalizeStorageEngine(): void {
		$this->assertSame( 'InnoDB', UltraStats_NormalizeStorageEngine( 'innodb' ) );
		$this->assertSame( 'MyISAM', UltraStats_NormalizeStorageEngine( 'MYISAM' ) );
		$this->assertNull( UltraStats_NormalizeStorageEngine( 'rocksdb' ) );
	}

	public function testApplyStorageEngineToSchemaSql(): void {
		$in  = 'CREATE TABLE x (id INT) TYPE=MyISAM;';
		$out = UltraStats_ApplyStorageEngineToSchemaSql( $in, 'InnoDB' );
		$this->assertStringContainsString( 'ENGINE=InnoDB', $out );
		$this->assertStringNotContainsString( 'TYPE=MyISAM', $out );
	}

	public function testSqlLikeContainsPattern_escapesMetacharacters(): void {
		$this->assertSame( '%foo\\%bar\\_baz\\\\%', UltraStats_SqlLikeContainsPattern( 'foo%bar_baz\\' ) );
	}
}
