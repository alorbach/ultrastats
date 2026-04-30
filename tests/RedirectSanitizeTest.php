<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

/**
 * Tests for UltraStats_SanitizeRedirectTarget (loaded via functions_common).
 */
final class RedirectSanitizeTest extends TestCase {

	public static function setUpBeforeClass(): void {
		if ( ! defined( 'IN_ULTRASTATS' ) ) {
			define( 'IN_ULTRASTATS', true );
		}
		global $gl_root_path;
		$gl_root_path = dirname( __DIR__ ) . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR;
		require_once $gl_root_path . 'include/functions_common.php';
	}

	public function testUltraStats_h_escapesForHtml(): void {
		$this->assertSame( '', UltraStats_h( '' ) );
		$this->assertSame( 'a&amp;b', UltraStats_h( 'a&b' ) );
		$this->assertSame( '&lt;tag&gt;', UltraStats_h( '<tag>' ) );
		$this->assertSame( '&quot;x&quot;', UltraStats_h( '"x"' ) );
	}

	public function testSanitize_empty_becomes_index(): void {
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( '' ) );
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( '   ' ) );
	}

	public function testSanitize_relative_allowed(): void {
		$this->assertSame( 'servers.php', UltraStats_SanitizeRedirectTarget( 'servers.php' ) );
		$this->assertSame( 'parser.php?op=runtotals', UltraStats_SanitizeRedirectTarget( 'parser.php?op=runtotals' ) );
	}

	public function testSanitize_absolute_http_blocked(): void {
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( 'https://evil.example/phish' ) );
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( '//evil.example/' ) );
	}

	public function testSanitize_javascript_blocked(): void {
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( 'javascript:alert(1)' ) );
	}

	public function testSanitize_data_blocked(): void {
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( 'data:text/html,base64' ) );
	}

	public function testSanitize_crlf_blocked(): void {
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( "index.php\r\nLocation: https://x" ) );
	}

	public function testSanitize_quotes_blocked(): void {
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( 'index.php" onload="alert(1)' ) );
	}

	public function testSanitize_leading_slash_blocked(): void {
		$this->assertSame( 'index.php', UltraStats_SanitizeRedirectTarget( '/admin/index.php' ) );
	}

	public function testEscapeErrorTextForHtml_escapesHtmlAndKeepsLineBreaks(): void {
		$in  = "<script>alert('x')</script>\nline2";
		$out = UltraStats_EscapeErrorTextForHtml( $in );
		$this->assertStringNotContainsString( '<script>', $out );
		$this->assertStringContainsString( '&lt;script&gt;alert(&#039;x&#039;)&lt;/script&gt;', $out );
		$this->assertStringContainsString( "<br>\nline2", $out );
	}

	public function testRenderStandaloneErrorDocumentHtml_criticalUsesHtml5Shell(): void {
		$errHtml = UltraStats_EscapeErrorTextForHtml( 'a & <tag>' );
		$html    = UltraStats_RenderStandaloneErrorDocumentHtml( $errHtml, true );
		$this->assertStringStartsWith( '<!DOCTYPE html>', $html );
		$this->assertStringContainsString( '<meta charset="utf-8">', $html );
		$this->assertStringContainsString( 'themes/codww/main.css', $html );
		$this->assertStringContainsString( 'a &amp; ', $html );
		$this->assertStringContainsString( '&lt;tag&gt;', $html );
	}

	public function testRenderStandaloneErrorDocumentHtml_friendlyUsesDefaultTheme(): void {
		$html = UltraStats_RenderStandaloneErrorDocumentHtml( 'ok', false );
		$this->assertStringContainsString( '<!DOCTYPE html>', $html );
		$this->assertStringContainsString( 'themes/default/main.css', $html );
	}
}
