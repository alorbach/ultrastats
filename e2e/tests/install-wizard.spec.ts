import { expect, test, type Page } from '@playwright/test';
import { loginAsAdmin } from '../lib/admin-login';
import { E2E_ADMIN_PASS, E2E_ADMIN_USER } from '../lib/e2e-credentials';
import {
  captureInstallStep,
  finalizeInstallReport,
  resetInstallReport,
} from '../lib/install-screenshots';

/** Prefer progress-bar Next; step text may embed an extra submit in the same form. */
async function clickInstallerNext(page: Page) {
  const next = page.locator('#mainform input[type="submit"][value="Next"]').last();
  await expect(
    next,
    'Install Next missing — step 2 may have failed file/dir checks (need world-writable bits on gamelogs + images/* per install.php)',
  ).toBeVisible({ timeout: 20_000 });
  await next.click();
}

test.describe.serial('install.php wizard', () => {
  test('clean install steps 1–7 on empty database', async ({ page }, testInfo) => {
    resetInstallReport();
    try {
      await page.goto('/install.php');

      await expect(page.getByText(/already configured\/installed/i)).toHaveCount(0);

      // Step 1
      await expect(page.locator('h1')).toContainText(/step 1/i);
      await captureInstallStep(page, testInfo, 1, 'Step 1 — Prerequisites');
      await clickInstallerNext(page);

      // Step 2 — file permissions
      await expect(page.locator('h1')).toContainText(/step 2/i);
      await captureInstallStep(page, testInfo, 2, 'Step 2 — File permissions');
      await clickInstallerNext(page);

      // Step 3 — database + game version
      await expect(page.locator('h1')).toContainText(/step 3/i);
      await page.locator('input[name="db_host"]').fill('db');
      await page.locator('input[name="db_port"]').fill('3306');
      await page.locator('input[name="db_name"]').fill('ultrastats_e2e');
      await page.locator('input[name="db_prefix"]').fill('stats_');
      await page.locator('input[name="db_user"]').fill('ultrastats');
      await page.locator('input[name="db_pass"]').fill('ultrastats');
      await page.locator('select[name="db_storage_engine"]').selectOption('InnoDB');
      await page.locator('select[name="gen_gameversion"]').selectOption('3');
      await captureInstallStep(page, testInfo, 3, 'Step 3 — Database configuration (CoD4 / InnoDB)');
      await clickInstallerNext(page);

      // Step 4 — confirm create tables
      await expect(page.locator('h1')).toContainText(/step 4/i);
      await captureInstallStep(page, testInfo, 4, 'Step 4 — Create tables (confirm)');
      await clickInstallerNext(page);

      // Step 5 — SQL results
      await expect(page.locator('h1')).toContainText(/step 5/i);
      await expect(page.getByText(/failed statements:/i)).toBeVisible();
      const failedLine = page.locator('li').filter({ hasText: /failed statements:/i });
      await expect(failedLine).toContainText(/\b0\b/);
      await expect(page.getByText(/at least one statement failed/i)).toHaveCount(0);
      await captureInstallStep(page, testInfo, 5, 'Step 5 — SQL results');

      await clickInstallerNext(page);

      // Step 6 — admin user
      await expect(page.locator('h1')).toContainText(/step 6/i);
      await page.locator('input[name="username"]').fill(E2E_ADMIN_USER);
      await page.locator('input[name="password1"]').fill(E2E_ADMIN_PASS);
      await page.locator('input[name="password2"]').fill(E2E_ADMIN_PASS);
      await captureInstallStep(page, testInfo, 6, 'Step 6 — First admin user');
      await clickInstallerNext(page);

      // Step 7 — done + user created
      await expect(page.getByText(/successfully created user/i)).toBeVisible();
      await expect(page.getByText(new RegExp(E2E_ADMIN_USER, 'i')).first()).toBeVisible();
      await captureInstallStep(page, testInfo, 7, 'Step 7 — Done (user created)');

      await page.getByRole('link', { name: 'Finish!' }).click();
      await expect(page).toHaveURL(/index\.php/);
      await captureInstallStep(page, testInfo, 8, 'Front page after Finish');

      // Smoke: admin login with new user
      await page.goto('/admin/login.php');
      await page.locator('input[name="uname"]').fill(E2E_ADMIN_USER);
      await page.locator('input[name="pass"]').fill(E2E_ADMIN_PASS);
      await captureInstallStep(page, testInfo, 9, 'Admin login form');
      await page.locator('form input[type="submit"]').click();
      await expect(page).toHaveURL(/admin\/index\.php/);
      await captureInstallStep(page, testInfo, 10, 'Admin home after login');
    } finally {
      finalizeInstallReport();
    }
  });
});

test.describe.serial('post-install admin', () => {
  test('add server', async ({ page }, testInfo) => {
    const serverName = 'E2E Test Server';
    try {
      await loginAsAdmin(page);
      await captureInstallStep(page, testInfo, 11, 'Admin home (before add server)');

      await page.goto('/admin/servers.php?op=add');
      await expect(page.locator('input[name="servername"]')).toBeVisible();
      await page.locator('input[name="servername"]').fill(serverName);
      await page.locator('input[name="serverip"]').fill('127.0.0.1');
      await page.locator('input[name="port"]').fill('28960');
      await captureInstallStep(page, testInfo, 12, 'Add server form');
      await page.getByRole('button', { name: /add server/i }).click();

      await expect(page).toHaveURL(/result\.php/);
      await expect(page.getByText(/successfully added/i)).toBeVisible();
      await captureInstallStep(page, testInfo, 13, 'Result after add server');

      await expect(page).toHaveURL(/servers\.php/i, { timeout: 10_000 });
      await expect(page.getByRole('link', { name: serverName })).toBeVisible();
      await captureInstallStep(page, testInfo, 14, 'Server list with new server');
    } finally {
      finalizeInstallReport();
    }
  });
});
