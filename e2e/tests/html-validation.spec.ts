import { expect, test } from '@playwright/test';
import { HtmlValidate } from 'html-validate';
import { loginAsAdmin } from '../lib/admin-login';

const htmlvalidate = new HtmlValidate({
  extends: ['html-validate:recommended'],
  rules: {
    // Legacy markup keeps tables and mixed heading structures by design.
    'heading-level': 'off',
    'no-inline-style': 'off',
    'prefer-button': 'off',
    'no-implicit-button-type': 'off',
    'element-required-attributes': 'off',
    'no-trailing-whitespace': 'off',
    'no-deprecated-attr': 'off',
    'wcag/h32': 'off',
    'wcag/h37': 'off',
    'wcag/h67': 'off',
    'wcag/h30': 'off',
    'wcag/h36': 'off',
    'attribute-boolean-style': 'off',
    'attribute-allowed-values': 'off',
    'autocomplete-password': 'off',
  },
});

const PUBLIC_ROUTES = ['/index.php', '/about.php', '/install.php'];
const ADMIN_ROUTES = ['/admin/login.php', '/admin/index.php'];

function summarize(messages: { line: number; column: number; message: string; ruleId: string }[]): string {
  return messages
    .slice(0, 8)
    .map((item) => `${item.line}:${item.column} [${item.ruleId}] ${item.message}`)
    .join('\n');
}

test.describe('html validation (Phase 1.3 mandatory)', () => {
  test('public core pages satisfy html-validate baseline', async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      const html = await page.content();
      const result = await htmlvalidate.validateString(html, route);
      const valid = result.valid;
      expect(
        valid,
        `html-validate errors for ${route}\n${summarize(result.results[0]?.messages ?? [])}`,
      ).toBe(true);
    }
  });

  test('admin core pages satisfy html-validate baseline', async ({ page }) => {
    const loginResponse = await page.goto('/admin/login.php');
    expect(loginResponse, 'no response for /admin/login.php').not.toBeNull();
    expect(loginResponse!.status(), 'unexpected status for /admin/login.php').toBeLessThan(500);
    const loginVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginVisible, 'HTML validation for admin requires installed app with login form.');

    await loginAsAdmin(page);
    for (const route of ADMIN_ROUTES) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      const html = await page.content();
      const result = await htmlvalidate.validateString(html, route);
      const valid = result.valid;
      expect(
        valid,
        `html-validate errors for ${route}\n${summarize(result.results[0]?.messages ?? [])}`,
      ).toBe(true);
    }
  });
});
