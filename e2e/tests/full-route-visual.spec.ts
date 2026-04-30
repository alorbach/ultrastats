import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../lib/admin-login';

const PUBLIC_ROUTES = [
  '/index.php',
  '/players.php',
  '/rounds.php',
  '/weapons.php',
  '/serverstats.php',
  '/medals.php',
  '/damagetypes.php',
  '/find-players.php',
  '/find-chat.php',
  '/about.php',
  '/info-gametypes.php',
  '/info-maps.php?id=mp_strike&serverid=2',
  '/rounds-detail.php?id=1',
  '/rounds-chatlog.php?id=1',
  '/players-detail.php?id=1',
];

const ADMIN_ROUTES = [
  '/admin/index.php',
  '/admin/servers.php',
  '/admin/players.php',
  '/admin/users.php',
  '/admin/stringeditor.php',
  '/admin/upgrade.php',
  '/admin/parser.php',
  '/admin/parser.php?op=runtotals',
];

function slug(route: string): string {
  return route
    .replace(/^\//, '')
    .replace(/[?&=]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '-');
}

test.describe('full route visual artifacts', () => {
  test('public route matrix screenshots', async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();

      const png = await page.screenshot({ fullPage: true, animations: 'disabled' });
      const minBytes = route.startsWith('/rounds-chatlog.php') ? 3_500 : 12_000;
      expect(png.byteLength, `screenshot bytes too small for ${route}`).toBeGreaterThan(minBytes);

      await expect(page).toHaveScreenshot(`public-${slug(route)}.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 50_000,
        maxDiffPixelRatio: 0.05,
      });
    }
  });

  test('admin route matrix screenshots', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin visual matrix requires installed app and reachable login form.');

    await loginAsAdmin(page);

    for (const route of ADMIN_ROUTES) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();

      const png = await page.screenshot({ fullPage: true, animations: 'disabled' });
      expect(png.byteLength, `screenshot bytes too small for ${route}`).toBeGreaterThan(12_000);

      await expect(page).toHaveScreenshot(`admin-${slug(route)}.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixels: 50_000,
        maxDiffPixelRatio: 0.05,
      });
    }
  });
});
