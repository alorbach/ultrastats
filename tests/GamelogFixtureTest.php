<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * Regression fixture: bundled CoD4 log excerpt must remain parse-shaped (line types, counts).
 * Full parser+DB integration stays in Docker / manual runs; this catches accidental truncation or format drift.
 */
final class GamelogFixtureTest extends TestCase {

	private const FIXTURE_LINES = 100;

	public function testCod4SampleFixture_structure(): void {
		$path = dirname( __DIR__ ) . '/tests/fixtures/cod4_sample.log';
		$this->assertFileExists( $path );

		$raw = file_get_contents( $path );
		$this->assertNotFalse( $raw );
		$lines = preg_split( "/\r\n|\n|\r/", rtrim( $raw, "\r\n" ) );
		$this->assertIsArray( $lines );
		$this->assertSame( self::FIXTURE_LINES, count( $lines ), 'Update FIXTURE_LINES if the sample log is resized.' );

		$joined = implode( "\n", $lines );
		$this->assertStringContainsString( 'InitGame:', $joined );
		$this->assertStringContainsString( 'mapname\\mp_carentan\\', $joined );
		$this->assertStringContainsString( 'gamename\\Call of Duty 4\\', $joined );

		$killLines = preg_match_all( '/^\s*\d+:\d+\s+K;/m', $joined );
		$this->assertGreaterThan( 5, $killLines );
		$joinLines = preg_match_all( '/^\s*\d+:\d+\s+J;/m', $joined );
		$this->assertGreaterThan( 3, $joinLines );
	}
}
