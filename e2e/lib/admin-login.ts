import { expect, type Page } from '@playwright/test';
import { E2E_ADMIN_PASS, E2E_ADMIN_USER } from './e2e-credentials';

export async function loginAsAdmin(
  page: Page,
  user: string = E2E_ADMIN_USER,
  pass: string = E2E_ADMIN_PASS,
) {
  await page.goto('/admin/login.php');
  await page.locator('input[name="uname"]').fill(user);
  await page.locator('input[name="pass"]').fill(pass);
  await page.locator('form input[type="submit"]').click();
  await expect(page).toHaveURL(/admin\/index\.php/);
}
