import { expect, type Page } from '@playwright/test';
import { E2E_ADMIN_PASS, E2E_ADMIN_USER } from './e2e-credentials';

async function tryAdminLogin(page: Page, user: string, pass: string) {
  await page.goto('/admin/login.php');
  await page.locator('input[name="uname"]').fill(user);
  await page.locator('input[name="pass"]').fill(pass);
  await page.locator('form input[type="submit"]').click();
  return /\/admin\/index\.php/.test(page.url());
}

export async function loginAsAdmin(
  page: Page,
  user: string = E2E_ADMIN_USER,
  pass: string = E2E_ADMIN_PASS,
) {
  const primaryLoginOk = await tryAdminLogin(page, user, pass);
  if (!primaryLoginOk && !(user === 'admin' && pass === 'pass')) {
    // Local docker/dev seed commonly uses admin/pass. Keep install-e2e credentials as primary.
    await tryAdminLogin(page, 'admin', 'pass');
  }
  await expect(page).toHaveURL(/admin\/index\.php/);
}
