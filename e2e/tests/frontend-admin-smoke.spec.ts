import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../lib/admin-login';

test.describe.serial('public frontend compatibility smoke', () => {
  test('core public routes render without server errors', async ({ page }) => {
    const routes = [
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
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('text=/Fatal error:/i')).toHaveCount(0);
      await expect(page.locator('text=/Parse error:/i')).toHaveCount(0);
    }
  });
});

test.describe.serial('admin compatibility smoke', () => {
  test('critical admin screens still load with legacy routes', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const adminRoutes = [
      '/admin/index.php',
      '/admin/servers.php',
      '/admin/players.php',
      '/admin/users.php',
      '/admin/stringeditor.php',
      '/admin/upgrade.php',
      '/admin/parser.php',
      '/admin/parser.php?op=runtotals',
    ];

    for (const route of adminRoutes) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('text=/Fatal error:/i')).toHaveCount(0);
      await expect(page.locator('text=/Parse error:/i')).toHaveCount(0);
    }

    const configResponse = await page.goto('/admin/index.php');
    expect(configResponse).not.toBeNull();
    await expect(page.locator('form')).toHaveCount(1);
    await expect(page.locator('input[name="gen_lang"], select[name="gen_lang"]')).toHaveCount(1);

    const loginResponse = await page.goto('/admin/login.php?op=logoff');
    expect(loginResponse).not.toBeNull();
    await expect(page.locator('input[name="uname"]')).toBeVisible();
  });
});

