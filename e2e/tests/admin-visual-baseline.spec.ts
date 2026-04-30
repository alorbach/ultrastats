import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../lib/admin-login';

/**
 * Phase 1.5 strict baseline:
 * - Full-page screenshot byte-size guard to detect empty/failed renders.
 * - Always-on pixel baseline compare for representative admin/public shells.
 */
test.describe('admin visual baseline (Phase 1.5)', () => {
  test('admin index after login is screenshot-stable', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Visual baseline requires an installed app and reachable login form.');

    await loginAsAdmin(page);
    const response = await page.goto('/admin/index.php');
    expect(response, 'no response for /admin/index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);

    await expect(page.locator('body')).toBeVisible();
    const png = await page.screenshot({ animations: 'disabled' });
    expect(png.byteLength, 'admin index screenshot should be non-trivial').toBeGreaterThan(12_000);

    await expect(page).toHaveScreenshot('admin-index.png', {
      maxDiffPixels: 50_000,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });

  test('public index outer chrome is screenshot-stable', async ({ page }) => {
    const response = await page.goto('/index.php');
    expect(response, 'no response for /index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expect(page.locator('table.us-chrome-top')).toHaveCount(1);
    await expect(page.locator('table.us-chrome-body')).toHaveCount(1);
    await expect(page.locator('table.us-chrome-footer')).toHaveCount(1);

    const png = await page.screenshot({ fullPage: true, animations: 'disabled' });
    expect(png.byteLength, 'public index screenshot should be non-trivial').toBeGreaterThan(12_000);

    await expect(page).toHaveScreenshot('public-index-outer-chrome.png', {
      fullPage: true,
      maxDiffPixels: 50_000,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });
});
