import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { loginAsAdmin } from '../lib/admin-login';

const PUBLIC_ERROR_PATTERN_CORE = /error|invalid|not found|missing/i;
const FIND_ERROR_PATTERN = /search|match|result|character|short|min|player|found/i;
const ROUNDS_ERROR_PATTERN = /id|invalid|not found|missing|round|detail/i;
const WEAPONS_ERROR_PATTERN = /id|invalid|not found|missing|weapon|detail/i;
const MAP_ERROR_PATTERN = /id|invalid|not found|missing|map|detail/i;
const MEDAL_ERROR_PATTERN = /id|invalid|not found|missing|medal|medaill|detail|fehler|exist/i;
const DAMAGE_ERROR_PATTERN = /damage|damagetype|schaden|invalid|id|detail|fehler|exist|stat|filter|data/i;
const PLAYER_DETAIL_ERROR_PATTERN = /player|invalid|id|empty|guid|error|spiel|fehler|played/i;
const ADMIN_ERROR_PATTERN_CORE = /error|invalid|not found|missing|failed|wrong/i;
const ADMIN_LOGIN_ERROR_PATTERN = /login|user|pass|wrong|invalid/i;
const ADMIN_UPGRADE_ERROR_PATTERN = /upgrade|statement|failed|error|invalid/i;
const ADMIN_PARSER_ERROR_PATTERN = /parser|server|id|invalid|not found|error/i;

async function expectNoPhpRuntimeErrors(page: Page) {
  await expect(page.locator('text=/Fatal error:/i')).toHaveCount(0);
  await expect(page.locator('text=/Parse error:/i')).toHaveCount(0);
}

async function expectNoPageHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    docScroll: document.documentElement.scrollWidth,
    bodyScroll: document.body.scrollWidth,
  }));
  expect(metrics.docScroll, 'document should not force page-level horizontal scroll').toBeLessThanOrEqual(
    metrics.viewport + 1,
  );
  expect(metrics.bodyScroll, 'body should not force page-level horizontal scroll').toBeLessThanOrEqual(
    metrics.viewport + 1,
  );
}

async function expectAdminChromeResponsive(page: Page, route: string) {
  const chromeMetrics = await page.locator('table.us-chrome-body').evaluate((el) => ({
    clientWidth: (el as HTMLElement).clientWidth,
    scrollWidth: (el as HTMLElement).scrollWidth,
  }));
  expect(chromeMetrics.scrollWidth, `admin body chrome should not force horizontal scroll on ${route}`).toBeLessThanOrEqual(
    chromeMetrics.clientWidth + 1,
  );

  const stripMetrics = await page.locator('table.us-admin-scroll-strip').evaluateAll((els) =>
    els.map((el) => ({
      clientWidth: (el as HTMLElement).clientWidth,
      scrollWidth: (el as HTMLElement).scrollWidth,
    })),
  );
  for (const [index, metrics] of stripMetrics.entries()) {
    expect(metrics.clientWidth, `admin scroll strip ${index} should fit body chrome on ${route}`).toBeLessThanOrEqual(
      chromeMetrics.clientWidth,
    );
    expect(metrics.scrollWidth, `admin scroll strip ${index} should retain its content on ${route}`).toBeGreaterThanOrEqual(
      metrics.clientWidth,
    );
  }
}

async function expectPublicChromeResponsive(page: Page, route: string) {
  const chromeMetrics = await page.locator('table.us-chrome-body').evaluate((el) => ({
    clientWidth: (el as HTMLElement).clientWidth,
    scrollWidth: (el as HTMLElement).scrollWidth,
  }));
  expect(chromeMetrics.scrollWidth, `public body chrome should not force horizontal scroll on ${route}`).toBeLessThanOrEqual(
    chromeMetrics.clientWidth + 1,
  );

  const stripMetrics = await page.locator('table.us-public-scroll-strip').evaluateAll((els) =>
    els.map((el) => ({
      clientWidth: (el as HTMLElement).clientWidth,
      scrollWidth: (el as HTMLElement).scrollWidth,
    })),
  );
  for (const [index, metrics] of stripMetrics.entries()) {
    expect(metrics.clientWidth, `public scroll strip ${index} should fit body chrome on ${route}`).toBeLessThanOrEqual(
      chromeMetrics.clientWidth,
    );
    expect(metrics.scrollWidth, `public scroll strip ${index} should retain its content on ${route}`).toBeGreaterThanOrEqual(
      metrics.clientWidth,
    );
  }
}

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
      await expectNoPhpRuntimeErrors(page);
      await expect(page.locator('table.us-chrome-top')).toHaveCount(1);
      await expect(page.locator('table.us-chrome-body')).toHaveCount(1);
      await expect(page.locator('table.us-chrome-footer')).toHaveCount(1);

      const routeSelectors: Record<string, string[]> = {
        '/index.php': ['#us-header-serverid', 'table.us-top-menu', 'table.us-chrome-pager'],
        '/players.php': ['#us-header-serverid', 'table.us-top-menu a.topmenu1_link'],
        '/rounds.php': ['#us-header-serverid', 'table.us-top-menu a.topmenu1_link'],
        '/weapons.php': ['#us-header-serverid', 'table.us-top-menu a.topmenu1_link'],
        '/serverstats.php': ['#us-header-serverid', 'table.us-top-menu a.topmenu1_link'],
        '/medals.php': ['#us-header-serverid', 'table.us-top-menu a.topmenu1_link'],
        '/damagetypes.php': ['#us-header-serverid', 'table.us-top-menu a.topmenu1_link'],
        '/find-players.php': ['form input#search-query[name="search"]', 'form select#search-type[name="searchtype"]'],
        '/find-chat.php': ['form input#chat-search-query[name="search"]'],
        '/about.php': ['#us-header-serverid', 'a[target="_blank"]'],
      };

      for (const selector of routeSelectors[route] ?? []) {
        await expect(page.locator(selector).first(), `missing selector ${selector} on ${route}`).toBeVisible();
      }
    }
  });

  test('representative public pages use HTML5 doctype and utf-8 charset meta', async ({ page }) => {
    const routes = ['/index.php', '/about.php'];
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      const docName = await page.evaluate(() => document.doctype?.name ?? '');
      expect(docName, `document.doctype.name for ${route}`).toBe('html');
      await expect(page.locator('meta[charset="utf-8"]')).toHaveCount(1);
      await expect(page.locator('meta[name="viewport"][content="width=device-width, initial-scale=1"]')).toHaveCount(
        1,
      );
      await expectNoPhpRuntimeErrors(page);

      if (route === '/index.php') {
        await expect(page.locator('label[for="us-header-serverid"]')).toHaveCount(1);
        await expect(page.locator('label[for="us-header-langcode"]')).toHaveCount(1);
        await expect(page.locator('label[for="us-header-stylename"]')).toHaveCount(1);
        const topMenuCells = page.locator('table.us-top-menu td.topmenu1');
        expect(await topMenuCells.count()).toBeGreaterThanOrEqual(6);
        await expect(page.locator('table.us-chrome-top')).toHaveCount(1);
        await expect(page.locator('table.us-chrome-body')).toHaveCount(1);
        await expect(page.locator('table.us-chrome-footer')).toHaveCount(1);
      }
    }
  });

  test('narrow viewport keeps shared header and menu overflow contained', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = [
      '/index.php',
      '/players.php',
      '/rounds.php',
      '/weapons.php',
      '/damagetypes.php',
      '/serverstats.php',
      '/medals.php',
      '/info-maps.php',
      '/info-gametypes.php',
      '/find-players.php',
      '/find-chat.php',
      '/about.php',
      '/admin/login.php',
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      await expectNoPhpRuntimeErrors(page);
      await expect(page.locator('table.us-chrome-top')).toHaveCount(1);
      await expectNoPageHorizontalOverflow(page);
      await expectPublicChromeResponsive(page, route);

      const logoBox = await page.locator('img[name="HeaderLogo"]').boundingBox();
      expect(logoBox, `header logo should be measurable on ${route}`).not.toBeNull();
      expect(logoBox!.width, `header logo should fit viewport on ${route}`).toBeLessThanOrEqual(390);

      const menu = page.locator('table.us-top-menu');
      if ((await menu.count()) > 0) {
        const menuMetrics = await menu.evaluate((el) => ({
          clientWidth: (el as HTMLElement).clientWidth,
          scrollWidth: (el as HTMLElement).scrollWidth,
        }));
        expect(menuMetrics.clientWidth, `top menu viewport width on ${route}`).toBeLessThanOrEqual(390);
        expect(menuMetrics.scrollWidth, `top menu should keep full menu content scrollable on ${route}`).toBeGreaterThan(
          menuMetrics.clientWidth,
        );
      }

      const pager = page.locator('table.us-chrome-pager');
      if ((await pager.count()) > 0) {
        const pagerMetrics = await pager.evaluate((el) => ({
          clientWidth: (el as HTMLElement).clientWidth,
          scrollWidth: (el as HTMLElement).scrollWidth,
        }));
        expect(pagerMetrics.clientWidth, `pager viewport width on ${route}`).toBeLessThanOrEqual(390);
      }
    }

    const detailHrefs: string[] = [];
    await page.goto('/players.php');
    if ((await page.locator('a[href^="players-detail.php?id="]').count()) > 0) {
      const playerDetailHref = await page.locator('a[href^="players-detail.php?id="]').first().getAttribute('href');
      if (playerDetailHref) {
        detailHrefs.push(playerDetailHref);
      }
    }
    await page.goto('/rounds.php');
    if ((await page.locator('a[href^="rounds-detail.php?id="]').count()) > 0) {
      const roundDetailHref = await page.locator('a[href^="rounds-detail.php?id="]').first().getAttribute('href');
      if (roundDetailHref) {
        detailHrefs.push(roundDetailHref);
      }
    }
    for (const href of detailHrefs) {
      const response = await page.goto(href);
      expect(response, `no response for ${href}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${href}`).toBeLessThan(500);
      await expectNoPhpRuntimeErrors(page);
      await expectNoPageHorizontalOverflow(page);
      await expectPublicChromeResponsive(page, href);
    }

    await page.goto('/admin/login.php');
    const loginInputVisible = await page.locator('input[name="uname"]').first().isVisible().catch(() => false);
    test.skip(!loginInputVisible, 'Admin narrow viewport smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    for (const route of [
      '/admin/index.php',
      '/admin/parser.php',
      '/admin/players.php',
      '/admin/servers.php',
      '/admin/users.php',
      '/admin/stringeditor.php',
      '/admin/upgrade.php',
    ]) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      await expectNoPhpRuntimeErrors(page);
      await expectNoPageHorizontalOverflow(page);
      await expectAdminChromeResponsive(page, route);

      const adminMenu = page.locator('table.us-admin-menu-chrome');
      await expect(adminMenu).toHaveCount(1);
      const adminMenuMetrics = await adminMenu.evaluate((el) => ({
        clientWidth: (el as HTMLElement).clientWidth,
        scrollWidth: (el as HTMLElement).scrollWidth,
      }));
      expect(adminMenuMetrics.clientWidth, `admin menu viewport width on ${route}`).toBeLessThanOrEqual(390);
      expect(adminMenuMetrics.scrollWidth, `admin menu should keep full menu content scrollable on ${route}`).toBeGreaterThan(
        adminMenuMetrics.clientWidth,
      );
    }
  });

  test('players list page exposes section title cell when player ranking is enabled', async ({ page }) => {
    const response = await page.goto('/players.php');
    expect(response, 'no response for /players.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /players.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    if ((await page.locator('td.title').count()) === 0) {
      test.skip(true, 'td.title absent (players disabled or empty install)');
    }
    await expect(page.locator('td.title').first()).toBeVisible();
  });

  test('rounds list page exposes section title cell when round list is enabled', async ({ page }) => {
    const response = await page.goto('/rounds.php');
    expect(response, 'no response for /rounds.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /rounds.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    if ((await page.locator('td.title').count()) === 0) {
      test.skip(true, 'td.title absent (rounds disabled or empty install)');
    }
    await expect(page.locator('td.title').first()).toBeVisible();
  });

  test('weapons list page exposes section title cell when weapon list is enabled', async ({ page }) => {
    const response = await page.goto('/weapons.php');
    expect(response, 'no response for /weapons.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /weapons.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    if ((await page.locator('td.title').count()) === 0) {
      test.skip(true, 'td.title absent (weapons list off, error state, or empty install)');
    }
    await expect(page.locator('td.title').first()).toBeVisible();
  });

  test('damage types list page exposes section title cell when list is enabled', async ({ page }) => {
    const response = await page.goto('/damagetypes.php');
    expect(response, 'no response for /damagetypes.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /damagetypes.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    if ((await page.locator('td.title').count()) === 0) {
      test.skip(true, 'td.title absent (damage list off, error state, or empty install)');
    }
    await expect(page.locator('td.title').first()).toBeVisible();
  });

  test('server stats page exposes section title cell when server list is enabled', async ({ page }) => {
    const response = await page.goto('/serverstats.php');
    expect(response, 'no response for /serverstats.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /serverstats.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    if ((await page.locator('td.title').count()) === 0) {
      test.skip(true, 'td.title absent (server list off, error state, or empty install)');
    }
    await expect(page.locator('td.title').first()).toBeVisible();
  });

  test('medals page exposes section title cell when medals UI is enabled', async ({ page }) => {
    const response = await page.goto('/medals.php');
    expect(response, 'no response for /medals.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /medals.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    if ((await page.locator('td.title').count()) === 0) {
      test.skip(true, 'td.title absent (medals disabled, error state, or empty install)');
    }
    await expect(page.locator('td.title').first()).toBeVisible();
  });

  test('about page exposes section title cell', async ({ page }) => {
    const response = await page.goto('/about.php');
    expect(response, 'no response for /about.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /about.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    await expect(page.locator('td.title').first()).toBeVisible();
  });

  test('alternate shipped themes render index after header style change (dark / codww)', async ({ page }) => {
    const response = await page.goto('/index.php');
    expect(response, 'no response for /index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const styleSelect = page.locator('#us-header-stylename');
    await expect(styleSelect).toBeVisible();

    const available: string[] = [];
    for (const themeName of ['dark', 'codww']) {
      if ((await styleSelect.locator(`option[value="${themeName}"]`).count()) > 0) {
        available.push(themeName);
      }
    }
    test.skip(
      available.length === 0,
      'Neither dark nor codww theme is listed in the style dropdown (themes/ layout differs).',
    );

    for (const themeName of available) {
      await Promise.all([
        page.waitForURL(/index\.php/i, { timeout: 15000 }),
        styleSelect.selectOption(themeName),
      ]);
      await expectNoPhpRuntimeErrors(page);
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('table.us-top-menu')).toHaveCount(1);
    }
  });

  test('public menu toggles use delegated handlers without inline JavaScript', async ({ page }) => {
    const response = await page.goto('/index.php');
    expect(response, 'no response for /index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const menu = page.locator('table.us-top-menu');
    await expect(menu).toHaveCount(1);
    await expect(menu.locator('[onclick], [onmousemove], [onmouseover], [onmouseout]')).toHaveCount(0);

    const searchToggle = menu.locator('img.us-toggle-display[data-toggle-target="menu_find"]');
    await expect(searchToggle).toHaveCount(1);
    await expect(page.locator('#menu_find[data-enhance-timeout="menu_find"]')).toHaveCount(1);

    await searchToggle.click();
    expect(await page.locator('#menu_find').getAttribute('style')).toContain('display: block');

    await searchToggle.click();
    expect(await page.locator('#menu_find').getAttribute('style')).toContain('display: none');
  });

  test('public stat bar popups use delegated handlers without inline JavaScript', async ({ page }) => {
    let verifiedRoutes = 0;

    for (const route of ['/weapons.php', '/damagetypes.php']) {
      const response = await page.goto(route);
      expect(response, `no response for ${route}`).not.toBeNull();
      expect(response!.status(), `unexpected status for ${route}`).toBeLessThan(500);
      await expectNoPhpRuntimeErrors(page);

      await expect(page.locator('[onmouseover], [onmousemove], [onmouseout], [onclick]')).toHaveCount(0);

      const statBar = page.locator('td.us-popup-help[data-popup-content]').first();
      const statBarCount = await statBar.count();
      if (statBarCount === 0) {
        continue;
      }

      verifiedRoutes += 1;
      await expect(page.locator('#popupdetails.us-popup-panel')).toHaveCount(1);
      await statBar.hover();
      await expect(page.locator('#popupdetails')).toHaveClass(/popupdetails_popup/);
      await expect(page.locator('#popupcontent')).toContainText(/\S+/);
    }

    test.skip(verifiedRoutes === 0, 'No delegated stat bar popup targets rendered in current dataset.');
  });

  test('install route stays reachable and install error block exposes alert semantics when shown', async ({
    page,
  }) => {
    const response = await page.goto('/install.php');
    expect(response, 'no response for /install.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /install.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg', { hasText: /error:/i }).first();
    const errorCount = await errorBox.count();
    test.skip(errorCount === 0, 'No install error block rendered in current install state.');

    await expect(errorBox).toContainText(/\S+/);
    await expect(page.locator('.ErrorMsg[role="alert"], [role="alert"].ErrorMsg')).toHaveCount(1);
  });

  test('find routes keep legacy GET field contracts', async ({ page }) => {
    const findPlayersResponse = await page.goto('/find-players.php');
    expect(findPlayersResponse, 'no response for /find-players.php').not.toBeNull();
    expect(findPlayersResponse!.status(), 'unexpected status for /find-players.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);
    await expect(page.locator('td.title').first()).toBeVisible();

    const playersForm = page.locator('form:has(input[name="search"])').first();
    await expect(playersForm.locator('input[name="search"]')).toBeVisible();
    await expect(playersForm).toHaveAttribute('method', /get/i);
    await expect(page.locator('input[name="search"]')).toHaveCount(1);
    await expect(page.locator('select[name="searchtype"]')).toHaveCount(1);
    await expect(page.locator('input[name="ignorecolorcodes"]')).toHaveCount(1);
    await expect(page.locator('label[for="search-query"]')).toHaveCount(1);
    await expect(page.locator('label[for="search-type"]')).toHaveCount(1);
    await expect(page.locator('label[for="ignore-color-codes"]')).toHaveCount(1);

    const findChatResponse = await page.goto('/find-chat.php');
    expect(findChatResponse, 'no response for /find-chat.php').not.toBeNull();
    expect(findChatResponse!.status(), 'unexpected status for /find-chat.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);
    await expect(page.locator('td.title').first()).toBeVisible();

    const chatForm = page.locator('form:has(input[name="search"])').first();
    await expect(chatForm.locator('input[name="search"]')).toBeVisible();
    await expect(chatForm).toHaveAttribute('method', /get/i);
    await expect(page.locator('input[name="search"]')).toHaveCount(1);
    await expect(page.locator('label[for="chat-search-query"]')).toHaveCount(1);
  });

  test('about route keeps safe target blank link rel attributes', async ({ page }) => {
    const aboutResponse = await page.goto('/about.php');
    expect(aboutResponse, 'no response for /about.php').not.toBeNull();
    expect(aboutResponse!.status(), 'unexpected status for /about.php').toBeLessThan(500);

    const targetBlankLinks = page.locator('td.tableBackground a[target="_blank"]');
    const targetBlankCount = await targetBlankLinks.count();
    expect(targetBlankCount, 'expected target=_blank links on about page').toBeGreaterThan(0);

    for (let i = 0; i < targetBlankCount; i += 1) {
      await expect(targetBlankLinks.nth(i)).toHaveAttribute('rel', /noopener/i);
      await expect(targetBlankLinks.nth(i)).toHaveAttribute('rel', /noreferrer/i);
    }
  });

  test('header logo image keeps descriptive alt text', async ({ page }) => {
    const response = await page.goto('/index.php');
    expect(response, 'no response for /index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const logo = page.locator('table.mainheader a[href*="index.php"] img[name="HeaderLogo"]').first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('alt', /\S+/);
  });

  test('header theme credit link keeps safe target blank rel when present', async ({ page }) => {
    const response = await page.goto('/index.php');
    expect(response, 'no response for /index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const creditLinks = page.locator('table.mainheader a.cellmenu2_link[target="_blank"]');
    const count = await creditLinks.count();
    test.skip(count === 0, 'Theme credit link not shown for current theme.');

    await expect(creditLinks.first()).toHaveAttribute('rel', /noopener/i);
    await expect(creditLinks.first()).toHaveAttribute('rel', /noreferrer/i);
  });

  test('info-gametypes handles missing id without server errors', async ({ page }) => {
    const response = await page.goto('/info-gametypes.php');
    expect(response, 'no response for /info-gametypes.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /info-gametypes.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);
    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(PUBLIC_ERROR_PATTERN_CORE);
    await expect(errorBox).toContainText(/game|type|id/i);
  });

  test('find-chat short search keeps compatible error flow and alert semantics', async ({ page }) => {
    const response = await page.goto('/find-chat.php?search=ab');
    expect(response, 'no response for /find-chat.php?search=ab').not.toBeNull();
    expect(response!.status(), 'unexpected status for /find-chat.php?search=ab').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(FIND_ERROR_PATTERN);
  });

  test('find-players no-match request remains stable', async ({ page }) => {
    const response = await page.goto('/find-players.php?search=zzzzultrastatsnomatchtokenzzzz&searchtype=2');
    expect(response, 'no response for find-players no-match route').not.toBeNull();
    expect(response!.status(), 'unexpected status for find-players no-match route').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);
    await expect(page.locator('input#search-query[name="search"]')).toHaveCount(1);
    await expect(page.locator('select#search-type[name="searchtype"]')).toHaveCount(1);

    const errorBox = page.locator('.ErrorMsg').first();
    const errorCount = await errorBox.count();
    if (errorCount > 0) {
      await expect(errorBox).toContainText(/\S+/);
      await expect(errorBox).toContainText(FIND_ERROR_PATTERN);
    }
  });

  test('rounds-detail missing id keeps compatible error rendering path', async ({ page }) => {
    const response = await page.goto('/rounds-detail.php');
    expect(response, 'no response for /rounds-detail.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /rounds-detail.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);
    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(ROUNDS_ERROR_PATTERN);
  });

  test('rounds-detail ratio bar images stay decorative when round data exists', async ({ page }) => {
    const roundsResponse = await page.goto('/rounds.php');
    expect(roundsResponse, 'no response for /rounds.php').not.toBeNull();
    expect(roundsResponse!.status(), 'unexpected status for /rounds.php').toBeLessThan(500);

    const roundDetailLinks = page.locator('a[href*="rounds-detail.php?id="]');
    const linkCount = await roundDetailLinks.count();
    test.skip(linkCount === 0, 'No rounds detail links available in current dataset.');

    const roundDetailHref = await roundDetailLinks.first().getAttribute('href');
    expect(roundDetailHref, 'rounds detail href should be present').toBeTruthy();

    const detailResponse = await page.goto(roundDetailHref!);
    expect(detailResponse, 'no response for first rounds-detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first rounds-detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const ratioBars = page.locator('img[src*="images/bars/bar-small/"]');
    const ratioBarCount = await ratioBars.count();
    test.skip(ratioBarCount === 0, 'No ratio bar images rendered for selected round.');

    for (let i = 0; i < ratioBarCount; i += 1) {
      await expect(ratioBars.nth(i)).toHaveAttribute('alt', '');
      await expect(ratioBars.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('rounds-detail team flags keep descriptive alt text when team layout exists', async ({ page }) => {
    const roundsResponse = await page.goto('/rounds.php');
    expect(roundsResponse, 'no response for /rounds.php').not.toBeNull();
    expect(roundsResponse!.status(), 'unexpected status for /rounds.php').toBeLessThan(500);

    const roundDetailLinks = page.locator('a[href*="rounds-detail.php?id="]');
    const linkCount = await roundDetailLinks.count();
    test.skip(linkCount === 0, 'No rounds detail links available in current dataset.');

    const roundDetailHref = await roundDetailLinks.first().getAttribute('href');
    expect(roundDetailHref, 'rounds detail href should be present').toBeTruthy();

    const detailResponse = await page.goto(roundDetailHref!);
    expect(detailResponse, 'no response for first rounds-detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first rounds-detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const axisFlag = page.locator('img[src*="flag-axis-small.png"]');
    const alliesFlag = page.locator('img[src*="flag-allies-small.png"]');
    const axisCount = await axisFlag.count();
    const alliesCount = await alliesFlag.count();
    test.skip(axisCount === 0 || alliesCount === 0, 'No team flag layout rendered for selected round.');

    await expect(axisFlag.first()).toHaveAttribute('alt', 'Axis');
    await expect(alliesFlag.first()).toHaveAttribute('alt', 'Allies');
  });

  test('rounds-detail chatlog iframe keeps descriptive title when detail view exists', async ({ page }) => {
    const roundsResponse = await page.goto('/rounds.php');
    expect(roundsResponse, 'no response for /rounds.php').not.toBeNull();
    expect(roundsResponse!.status(), 'unexpected status for /rounds.php').toBeLessThan(500);

    const roundDetailLinks = page.locator('a[href*="rounds-detail.php?id="]');
    const linkCount = await roundDetailLinks.count();
    test.skip(linkCount === 0, 'No rounds detail links available in current dataset.');

    const roundDetailHref = await roundDetailLinks.first().getAttribute('href');
    expect(roundDetailHref, 'rounds detail href should be present').toBeTruthy();

    const detailResponse = await page.goto(roundDetailHref!);
    expect(detailResponse, 'no response for first rounds-detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first rounds-detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const chatlogFrame = page.locator('iframe#container');
    const chatlogFrameCount = await chatlogFrame.count();
    test.skip(chatlogFrameCount === 0, 'No rounds-detail chatlog iframe rendered for selected round.');

    await expect(chatlogFrame.first()).toHaveAttribute('title', /\S+/);
  });

  test('weapons external links keep safe target blank rel attributes', async ({ page }) => {
    const response = await page.goto('/weapons.php');
    expect(response, 'no response for /weapons.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /weapons.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const targetBlankLinks = page.locator('a[target="_blank"]:not(.cellmenu2_link)');
    const linkCount = await targetBlankLinks.count();
    test.skip(linkCount === 0, 'No external target=_blank links rendered for current weapons dataset.');

    for (let i = 0; i < linkCount; i += 1) {
      await expect(targetBlankLinks.nth(i)).toHaveAttribute('rel', /noopener/i);
      await expect(targetBlankLinks.nth(i)).toHaveAttribute('rel', /noreferrer/i);
    }
  });

  test('weapons bar images stay decorative', async ({ page }) => {
    const response = await page.goto('/weapons.php');
    expect(response, 'no response for /weapons.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /weapons.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const barImages = page.locator('img[src*="images/bars/bar-small/"]');
    const barCount = await barImages.count();
    test.skip(barCount === 0, 'No weapons bar images rendered for current dataset.');

    for (let i = 0; i < barCount; i += 1) {
      await expect(barImages.nth(i)).toHaveAttribute('alt', '');
      await expect(barImages.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('weapons invalid id keeps compatible error flow and alert semantics', async ({ page }) => {
    const response = await page.goto('/weapons.php?id=__invalid_weapon_id__');
    expect(response, 'no response for /weapons.php invalid id').not.toBeNull();
    expect(response!.status(), 'unexpected status for /weapons.php invalid id').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(WEAPONS_ERROR_PATTERN);
  });

  test('info-maps missing id keeps compatible error flow and alert semantics', async ({ page }) => {
    const response = await page.goto('/info-maps.php');
    expect(response, 'no response for /info-maps.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /info-maps.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(PUBLIC_ERROR_PATTERN_CORE);
    await expect(errorBox).toContainText(MAP_ERROR_PATTERN);
  });

  test('info-maps last rounds row icons stay decorative when map detail has last rounds', async ({ page }) => {
    const roundsResponse = await page.goto('/rounds.php');
    expect(roundsResponse, 'no response for /rounds.php').not.toBeNull();
    expect(roundsResponse!.status(), 'unexpected status for /rounds.php').toBeLessThan(500);

    const mapLinks = page.locator('a[href*="info-maps.php?id="]');
    const linkCount = await mapLinks.count();
    test.skip(linkCount === 0, 'No info-maps links available in current dataset.');

    const mapHref = await mapLinks.first().getAttribute('href');
    expect(mapHref, 'info-maps href should be present').toBeTruthy();

    const detailResponse = await page.goto(mapHref!);
    expect(detailResponse, 'no response for first info-maps route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first info-maps route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const dateIcons = page.locator('img[src*="images/icons/date-time.png"]');
    const arrowIcons = page.locator('img[src*="images/icons/arrow_right_blue.png"]');
    const dateCount = await dateIcons.count();
    const arrowCount = await arrowIcons.count();
    test.skip(
      dateCount === 0 || arrowCount === 0,
      'No last-rounds icon row rendered for selected map.',
    );

    for (let i = 0; i < dateCount; i += 1) {
      await expect(dateIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(dateIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
    for (let i = 0; i < arrowCount; i += 1) {
      await expect(arrowIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(arrowIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('medals invalid id keeps compatible error flow and alert semantics', async ({ page }) => {
    const response = await page.goto('/medals.php?id=__invalid_medal_id__');
    expect(response, 'no response for /medals.php invalid id').not.toBeNull();
    expect(response!.status(), 'unexpected status for /medals.php invalid id').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(PUBLIC_ERROR_PATTERN_CORE);
    await expect(errorBox).toContainText(MEDAL_ERROR_PATTERN);
  });

  test('medals detail bar images stay decorative when medal leaderboard exists', async ({ page }) => {
    const indexResponse = await page.goto('/index.php');
    expect(indexResponse, 'no response for /index.php').not.toBeNull();
    expect(indexResponse!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const medalLinks = page.locator('a[href*="medals.php?id="]');
    const linkCount = await medalLinks.count();
    test.skip(linkCount === 0, 'No medals detail links available on main page for current dataset.');

    const medalHref = await medalLinks.first().getAttribute('href');
    expect(medalHref, 'medals detail href should be present').toBeTruthy();

    const detailResponse = await page.goto(medalHref!);
    expect(detailResponse, 'no response for first medals detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first medals detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const barImages = page.locator('img[src*="images/bars/bar-small/"]');
    const barCount = await barImages.count();
    test.skip(barCount === 0, 'No medal bar images rendered for selected medal.');

    for (let i = 0; i < barCount; i += 1) {
      await expect(barImages.nth(i)).toHaveAttribute('alt', '');
      await expect(barImages.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('damagetypes invalid id keeps compatible error flow and alert semantics', async ({ page }) => {
    const response = await page.goto('/damagetypes.php?id=__invalid_damage_type__');
    expect(response, 'no response for /damagetypes.php invalid id').not.toBeNull();
    expect(response!.status(), 'unexpected status for /damagetypes.php invalid id').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(PUBLIC_ERROR_PATTERN_CORE);
    await expect(errorBox).toContainText(DAMAGE_ERROR_PATTERN);
  });

  test('damagetypes list summary bar images stay decorative when damage list renders', async ({ page }) => {
    const response = await page.goto('/damagetypes.php');
    expect(response, 'no response for /damagetypes.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /damagetypes.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const detailLinks = page.locator('a[href*="damagetypes.php?id="]');
    const linkCount = await detailLinks.count();
    test.skip(linkCount === 0, 'No damagetypes list rows in current dataset (empty or error state).');

    const barImages = page.locator('img[src*="images/bars/bar-small/"]');
    const barCount = await barImages.count();
    test.skip(barCount === 0, 'No summary bar images on damagetypes list for current dataset.');

    for (let i = 0; i < barCount; i += 1) {
      await expect(barImages.nth(i)).toHaveAttribute('alt', '');
      await expect(barImages.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('damagetypes detail bar images stay decorative when damage detail has leaderboards', async ({ page }) => {
    const listResponse = await page.goto('/damagetypes.php');
    expect(listResponse, 'no response for /damagetypes.php').not.toBeNull();
    expect(listResponse!.status(), 'unexpected status for /damagetypes.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const detailLinks = page.locator('a[href*="damagetypes.php?id="]');
    const linkCount = await detailLinks.count();
    test.skip(linkCount === 0, 'No damagetypes detail links in current dataset.');

    const detailHref = await detailLinks.first().getAttribute('href');
    expect(detailHref, 'damagetypes detail href should be present').toBeTruthy();

    const detailResponse = await page.goto(detailHref!);
    expect(detailResponse, 'no response for first damagetypes detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first damagetypes detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const barImages = page.locator('img[src*="images/bars/bar-small/"]');
    const barCount = await barImages.count();
    test.skip(barCount === 0, 'No damagetypes detail bar images for selected type.');

    for (let i = 0; i < barCount; i += 1) {
      await expect(barImages.nth(i)).toHaveAttribute('alt', '');
      await expect(barImages.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('rounds list row icons stay decorative when rounds list renders', async ({ page }) => {
    const response = await page.goto('/rounds.php');
    expect(response, 'no response for /rounds.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /rounds.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const dateIcons = page.locator('img[src*="images/icons/date-time.png"]');
    const arrowIcons = page.locator('img[src*="images/icons/arrow_right_blue.png"]');
    const dateCount = await dateIcons.count();
    const arrowCount = await arrowIcons.count();
    test.skip(
      dateCount === 0 || arrowCount === 0,
      'No rounds list icon columns rendered for current dataset.',
    );

    for (let i = 0; i < dateCount; i += 1) {
      await expect(dateIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(dateIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
    for (let i = 0; i < arrowCount; i += 1) {
      await expect(arrowIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(arrowIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('serverstats list server icons stay decorative when global server list renders', async ({ page }) => {
    const response = await page.goto('/serverstats.php');
    expect(response, 'no response for /serverstats.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /serverstats.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const serverIcons = page.locator('img[src*="images/icons/server.png"]');
    const iconCount = await serverIcons.count();
    test.skip(iconCount === 0, 'No server list rows rendered (maps-only view or empty list).');

    for (let i = 0; i < iconCount; i += 1) {
      await expect(serverIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(serverIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('serverstats map last-rounds icons stay decorative when per-map last rounds render', async ({ page }) => {
    const listResponse = await page.goto('/serverstats.php');
    expect(listResponse, 'no response for /serverstats.php').not.toBeNull();
    expect(listResponse!.status(), 'unexpected status for /serverstats.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const serverLinks = page.locator('a[href*="serverstats.php?serverid="]');
    const linkCount = await serverLinks.count();
    test.skip(linkCount === 0, 'No serverstats server picker links in current dataset.');

    const serverHref = await serverLinks.first().getAttribute('href');
    expect(serverHref, 'serverstats server href should be present').toBeTruthy();

    const detailResponse = await page.goto(serverHref!);
    expect(detailResponse, 'no response for first serverstats detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first serverstats detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const dateIcons = page.locator('img[src*="images/icons/date-time.png"]');
    const arrowIcons = page.locator('img[src*="images/icons/arrow_right_blue.png"]');
    const dateCount = await dateIcons.count();
    const arrowCount = await arrowIcons.count();
    test.skip(
      dateCount === 0 || arrowCount === 0,
      'No serverstats last-rounds icon rows for selected server.',
    );

    for (let i = 0; i < dateCount; i += 1) {
      await expect(dateIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(dateIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
    for (let i = 0; i < arrowCount; i += 1) {
      await expect(arrowIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(arrowIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('players list bar images stay decorative when players list renders', async ({ page }) => {
    const response = await page.goto('/players.php');
    expect(response, 'no response for /players.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /players.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const barImages = page.locator('img[src*="images/bars/bar-small/"]');
    const barCount = await barImages.count();
    test.skip(barCount === 0, 'No players list bar images for current dataset.');

    for (let i = 0; i < barCount; i += 1) {
      await expect(barImages.nth(i)).toHaveAttribute('alt', '');
      await expect(barImages.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('index top players kill ratio bar images stay decorative when main top players render', async ({ page }) => {
    const response = await page.goto('/index.php');
    expect(response, 'no response for /index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const barImages = page.locator('img[src*="images/bars/bar-small/"]');
    const barCount = await barImages.count();
    test.skip(barCount === 0, 'No index bar-small images (top players block may be off or empty).');

    for (let i = 0; i < barCount; i += 1) {
      await expect(barImages.nth(i)).toHaveAttribute('alt', '');
      await expect(barImages.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('index main last-rounds row icons stay decorative when home last rounds render', async ({ page }) => {
    const response = await page.goto('/index.php');
    expect(response, 'no response for /index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const dateIcons = page.locator('img[src*="images/icons/date-time.png"]');
    const arrowIcons = page.locator('img[src*="images/icons/arrow_right_blue.png"]');
    const dateCount = await dateIcons.count();
    const arrowCount = await arrowIcons.count();
    test.skip(
      dateCount === 0 || arrowCount === 0,
      'No index last-rounds icon rows for current home layout.',
    );

    for (let i = 0; i < dateCount; i += 1) {
      await expect(dateIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(dateIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
    for (let i = 0; i < arrowCount; i += 1) {
      await expect(arrowIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(arrowIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('index global server list server icons stay decorative when multi-server list renders', async ({ page }) => {
    const response = await page.goto('/index.php');
    expect(response, 'no response for /index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const serverIcons = page.locator('img[src*="images/icons/server.png"]');
    const iconCount = await serverIcons.count();
    test.skip(iconCount === 0, 'No global server list on index for current layout.');

    for (let i = 0; i < iconCount; i += 1) {
      await expect(serverIcons.nth(i)).toHaveAttribute('alt', '');
      await expect(serverIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('players-detail invalid id keeps compatible error flow and alert semantics', async ({ page }) => {
    const response = await page.goto('/players-detail.php?id=not_a_valid_player_id');
    expect(response, 'no response for /players-detail.php invalid id').not.toBeNull();
    expect(response!.status(), 'unexpected status for /players-detail.php invalid id').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(PUBLIC_ERROR_PATTERN_CORE);
    await expect(errorBox).toContainText(PLAYER_DETAIL_ERROR_PATTERN);
  });

  test('rounds-chatlog invalid id keeps compatible error alert in iframe document', async ({ page }) => {
    const response = await page.goto('/rounds-chatlog.php?id=0');
    expect(response, 'no response for /rounds-chatlog.php?id=0').not.toBeNull();
    expect(response!.status(), 'unexpected status for /rounds-chatlog.php?id=0').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toHaveAttribute('role', 'alert');
    await expect(errorBox).toHaveAttribute('aria-live', 'assertive');
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(PUBLIC_ERROR_PATTERN_CORE);
    await expect(errorBox).toContainText(ROUNDS_ERROR_PATTERN);
  });

  test('players-detail last rounds icons and bar images stay decorative when player stats render', async ({
    page,
  }) => {
    const listResponse = await page.goto('/players.php');
    expect(listResponse, 'no response for /players.php').not.toBeNull();
    expect(listResponse!.status(), 'unexpected status for /players.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const detailLinks = page.locator('a[href*="players-detail.php?id="]');
    const linkCount = await detailLinks.count();
    test.skip(linkCount === 0, 'No players detail links in current dataset.');

    const detailHref = await detailLinks.first().getAttribute('href');
    expect(detailHref, 'players-detail href should be present').toBeTruthy();

    const detailResponse = await page.goto(detailHref!);
    expect(detailResponse, 'no response for first players-detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first players-detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const dateIcons = page.locator('img[src*="images/icons/date-time.png"]');
    const barImages = page.locator('img[src*="images/bars/bar-small/"]');
    const dateCount = await dateIcons.count();
    const barCount = await barImages.count();
    test.skip(
      dateCount === 0 && barCount === 0,
      'No last-rounds icons or bar-small images on player detail for selected player.',
    );

    if (dateCount > 0) {
      for (let i = 0; i < dateCount; i += 1) {
        await expect(dateIcons.nth(i)).toHaveAttribute('alt', '');
        await expect(dateIcons.nth(i)).toHaveAttribute('aria-hidden', 'true');
      }
    }
    if (barCount > 0) {
      for (let i = 0; i < barCount; i += 1) {
        await expect(barImages.nth(i)).toHaveAttribute('alt', '');
        await expect(barImages.nth(i)).toHaveAttribute('aria-hidden', 'true');
      }
    }
  });

  test('players-detail time filter year/month selects use us-autosubmit-select when enabled', async ({ page }) => {
    const listResponse = await page.goto('/players.php');
    expect(listResponse, 'no response for /players.php').not.toBeNull();
    expect(listResponse!.status(), 'unexpected status for /players.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const detailLinks = page.locator('a[href*="players-detail.php?id="]');
    const linkCount = await detailLinks.count();
    test.skip(linkCount === 0, 'No players detail links in current dataset.');

    const detailHref = await detailLinks.first().getAttribute('href');
    expect(detailHref, 'players-detail href should be present').toBeTruthy();

    const detailResponse = await page.goto(detailHref!);
    expect(detailResponse, 'no response for first players-detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first players-detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const yearSelect = page.locator('form[name="yearidform"] select[name="newyear"]');
    const yearCount = await yearSelect.count();
    test.skip(
      yearCount === 0,
      'Time filter not rendered (no stats_time data / ENABLETIMEFILTER off) — skip pager autosubmit assertion.',
    );

    await expect(yearSelect).toHaveClass(/us-autosubmit-select/);
    expect(
      await yearSelect.getAttribute('onchange'),
      'year select should not use inline onchange (Phase 5.2 delegated handler)',
    ).toBeNull();

    const monthSelect = page.locator('form[name="monthidform"] select[name="newmonth"]');
    const monthCount = await monthSelect.count();
    if (monthCount > 0) {
      await expect(monthSelect).toHaveClass(/us-autosubmit-select/);
      expect(await monthSelect.getAttribute('onchange')).toBeNull();
    }
  });

  test('players-detail hit location map uses delegated hover handlers', async ({ page }) => {
    const listResponse = await page.goto('/players.php');
    expect(listResponse, 'no response for /players.php').not.toBeNull();
    expect(listResponse!.status(), 'unexpected status for /players.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const detailLinks = page.locator('a[href*="players-detail.php?id="]');
    const linkCount = await detailLinks.count();
    test.skip(linkCount === 0, 'No players detail links in current dataset.');

    const detailHref = await detailLinks.first().getAttribute('href');
    expect(detailHref, 'players-detail href should be present').toBeTruthy();

    const detailResponse = await page.goto(detailHref!);
    expect(detailResponse, 'no response for first players-detail route').not.toBeNull();
    expect(detailResponse!.status(), 'unexpected status for first players-detail route').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const hitlocPanel = page.locator('.us-hitloc-panel').first();
    const hitlocCount = await hitlocPanel.count();
    test.skip(hitlocCount === 0, 'Hit location panel not rendered for selected player.');

    await expect(hitlocPanel.locator('[onmouseover], [onmousemove], [onmouseout]')).toHaveCount(0);

    const hoverPart = hitlocPanel.locator('img.us-player-popup-part[data-popup-content][data-popup-image]').first();
    const hoverPartCount = await hoverPart.count();
    test.skip(hoverPartCount === 0, 'Hit location hover parts not rendered for selected player.');

    await hoverPart.hover();
    await expect(page.locator('#popupdetails')).toHaveClass(/popupdetails_popup/);
    await expect(page.locator('#popupcontent')).toContainText(/\S+/);
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
      await expectNoPhpRuntimeErrors(page);
      await expect(page.locator('table.us-chrome-top')).toHaveCount(1);
      await expect(page.locator('table.us-chrome-body')).toHaveCount(1);
      await expect(page.locator('table.us-chrome-footer')).toHaveCount(1);
      await expect(page.locator('table.us-admin-menu-chrome')).toHaveCount(1);

      if (route === '/admin/index.php') {
        expect(await page.locator('table.us-admin-config-table').count()).toBeGreaterThan(0);
        expect(await page.locator('table.us-admin-summary-table').count()).toBeGreaterThan(0);
      }
    }

    const configResponse = await page.goto('/admin/index.php');
    expect(configResponse).not.toBeNull();
    await expect(page.locator('form')).toHaveCount(1);
    await expect(page.locator('input[name="gen_lang"], select[name="gen_lang"]')).toHaveCount(1);

    const loginResponse = await page.goto('/admin/login.php?op=logoff');
    expect(loginResponse).not.toBeNull();
    await expect(page.locator('input[name="uname"]')).toBeVisible();
  });

  test('admin index uses HTML5 doctype and utf-8 charset meta', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);
    const response = await page.goto('/admin/index.php');
    expect(response, 'no response for /admin/index.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);
    const docName = await page.evaluate(() => document.doctype?.name ?? '');
    expect(docName).toBe('html');
    await expect(page.locator('meta[charset="utf-8"]')).toHaveCount(1);
    await expect(page.locator('meta[name="viewport"][content="width=device-width, initial-scale=1"]')).toHaveCount(
      1,
    );
    await expect(page.locator('table.us-chrome-top')).toHaveCount(1);
    await expect(page.locator('table.us-chrome-body')).toHaveCount(1);
    await expect(page.locator('table.us-chrome-footer')).toHaveCount(1);
    await expectNoPhpRuntimeErrors(page);
  });

  test('admin servers tooltips use delegated handlers without inline JavaScript', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);
    const response = await page.goto('/admin/servers.php');
    expect(response, 'no response for /admin/servers.php').not.toBeNull();
    expect(response!.status(), 'unexpected status for /admin/servers.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('[onmouseover], [onmousemove], [onmouseout], [onclick]')).toHaveCount(0);
    await expect(page.locator('#popupdetails.us-popup-panel')).toHaveCount(1);

    const tooltipTarget = page.locator('.us-popup-help[data-popup-content]').first();
    const tooltipCount = await tooltipTarget.count();
    test.skip(tooltipCount === 0, 'No delegated admin server tooltip target rendered.');

    await tooltipTarget.hover();
    await expect(page.locator('#popupdetails')).toHaveClass(/popupdetails_popup/);
    await expect(page.locator('#popupcontent')).toContainText(/\S+/);
  });

  test('admin result.php sanitizes meta refresh URL and HTML-escapes message', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const safeMsg = 'Saved ok';
    const okResponse = await page.goto(
      `/admin/result.php?redir=${encodeURIComponent('servers.php')}&msg=${encodeURIComponent(safeMsg)}`,
    );
    expect(okResponse, 'no response for result.php').not.toBeNull();
    expect(okResponse!.status(), 'unexpected status for result.php').toBeLessThan(500);
    const okHtml = await okResponse!.text();
    expect(okHtml, 'result.php should render the escaped flash message before meta refresh').toContain(safeMsg);
    expect(okHtml, 'result.php should not contain PHP runtime errors').not.toMatch(/Fatal error|Warning:|Parse error|Notice:/i);
    expect(okHtml, 'meta refresh should point at sanitized relative target').toMatch(
      /url=servers\.php/i,
    );

    const extResponse = await page.goto(
      `/admin/result.php?redir=${encodeURIComponent('https://evil.example/phish')}&msg=${encodeURIComponent('x')}`,
    );
    expect(extResponse!.status()).toBeLessThan(500);
    const extHtml = await extResponse!.text();
    expect(extHtml).toMatch(/url=index\.php/i);

    const jsResponse = await page.goto(
      `/admin/result.php?redir=${encodeURIComponent('javascript:alert(1)')}&msg=${encodeURIComponent('x')}`,
    );
    expect(jsResponse!.status()).toBeLessThan(500);
    const jsHtml = await jsResponse!.text();
    expect(jsHtml).toMatch(/url=index\.php/i);

    const xssResponse = await page.goto(
      `/admin/result.php?redir=${encodeURIComponent('servers.php')}&msg=${encodeURIComponent(
        '<script>document.body.setAttribute("data-us-xss","1")</script>',
      )}`,
    );
    expect(xssResponse!.status()).toBeLessThan(500);
    const xssHtml = await xssResponse!.text();
    expect(xssHtml).not.toContain('<script>document.body.setAttribute("data-us-xss","1")</script>');

    const noRedirResponse = await page.goto(
      `/admin/result.php?msg=${encodeURIComponent('hello-only')}`,
    );
    expect(noRedirResponse!.status()).toBeLessThan(500);
    const noRedirHtml = await noRedirResponse!.text();
    expect(noRedirHtml).not.toMatch(/http-equiv=["']refresh["']/i);
    expect(noRedirHtml).toContain('hello-only');
  });

  test('admin shell header logo and footer external links keep safe blank-target rel', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const indexResponse = await page.goto('/admin/index.php');
    expect(indexResponse, 'no response for /admin/index.php').not.toBeNull();
    expect(indexResponse!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const logo = page.locator('table.mainheader a[href*="index.php"] img[name="HeaderLogo"]').first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('alt', /\S+/);

    const footerBlanks = page.locator('table.mainfooter a[target="_blank"]');
    const footerCount = await footerBlanks.count();
    expect(footerCount, 'admin footer should expose external links').toBeGreaterThan(0);
    for (let i = 0; i < footerCount; i += 1) {
      await expect(footerBlanks.nth(i)).toHaveAttribute('rel', /noopener/i);
      await expect(footerBlanks.nth(i)).toHaveAttribute('rel', /noreferrer/i);
    }

    const updateBannerBlanks = page.locator('.table_with_border_second.ErrorMsg a[target="_blank"]');
    const updateCount = await updateBannerBlanks.count();
    for (let i = 0; i < updateCount; i += 1) {
      await expect(updateBannerBlanks.nth(i)).toHaveAttribute('rel', /noopener/i);
      await expect(updateBannerBlanks.nth(i)).toHaveAttribute('rel', /noreferrer/i);
    }
  });

  test('admin players list view keeps non-destructive legacy render contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const playersResponse = await page.goto('/admin/players.php');
    expect(playersResponse, 'no response for /admin/players.php').not.toBeNull();
    expect(playersResponse!.status(), 'unexpected status for /admin/players.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('input[name="playerfilter"]')).toHaveCount(1);
    await expect(page.locator('input#admin-player-filter[name="playerfilter"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-player-filter"]')).toHaveCount(1);
    await expect(page.locator('.us-admin-player-filter-bar')).toHaveCount(1);
    await expect(page.locator('input[name="start"]')).toHaveCount(1);

    const clanActionCount = await page.locator('a[href*="playerop=setclanmember"]').count();
    test.skip(
      clanActionCount === 0,
      'No player rows; install-e2e does not seed stats_players until logs are parsed.',
    );

    await expect(page.locator('a[href*="playerop=setclanmember"]').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="playerop=setban"]').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="players.php?op=edit&id="]:has(img[src*="images/icons/edit.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="op=delete&id="]:has(img[src*="images/icons/delete.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="op=delete&id="].us-confirm-nav').first()).toHaveAttribute('data-confirm-message', /\S+/);
    await expect(page.locator('a[href*="playerop=setclanmember"] img[aria-hidden="true"][alt=""]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="playerop=setban"] img[aria-hidden="true"][alt=""]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="players.php?op=edit&id="]').first()).toBeVisible();
  });

  test('admin players edit view keeps checkbox label associations', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const playersResponse = await page.goto('/admin/players.php');
    expect(playersResponse, 'no response for /admin/players.php').not.toBeNull();
    expect(playersResponse!.status(), 'unexpected status for /admin/players.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const editLink = page.locator('a[href*="players.php?op=edit&id="]').first();
    const editLinkCount = await page.locator('a[href*="players.php?op=edit&id="]').count();
    test.skip(editLinkCount === 0, 'No player rows; edit link not rendered.');

    await expect(editLink).toBeVisible();
    const editHref = await editLink.getAttribute('href');
    expect(editHref, 'edit href should be present').toBeTruthy();

    const editResponse = await page.goto(`/admin/${editHref!}`);
    expect(editResponse, 'no response for players edit view').not.toBeNull();
    expect(editResponse!.status(), 'unexpected status for players edit view').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('input#admin-player-isclanmember[name="isclanmember"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-player-isclanmember"]')).toHaveCount(1);
    await expect(page.locator('input#admin-player-isbanned[name="isbanned"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-player-isbanned"]')).toHaveCount(1);
    await expect(page.locator('textarea#admin-player-banreason[name="banreason"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-player-banreason"]')).toHaveCount(1);
  });

  test('admin players delete verify view keeps non-destructive action labels', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const playersResponse = await page.goto('/admin/players.php');
    expect(playersResponse, 'no response for /admin/players.php').not.toBeNull();
    expect(playersResponse!.status(), 'unexpected status for /admin/players.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const deleteLink = page.locator('a[href*="op=delete&id="]:has(img[src*="images/icons/delete.png"])').first();
    const deleteLinkCount = await page
      .locator('a[href*="op=delete&id="]:has(img[src*="images/icons/delete.png"])')
      .count();
    test.skip(deleteLinkCount === 0, 'No player rows; delete link not rendered.');

    await expect(deleteLink).toBeVisible();
    const deleteHref = await deleteLink.getAttribute('href');
    expect(deleteHref, 'delete href should be present').toBeTruthy();

    const verifyResponse = await page.goto(`/admin/${deleteHref!}`);
    expect(verifyResponse, 'no response for players delete verify view').not.toBeNull();
    expect(verifyResponse!.status(), 'unexpected status for players delete verify view').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const confirmForm = page.locator('form[action="players.php"][method="post"]').first();
    await expect(confirmForm.locator('input[name="op"][value="delete"]')).toHaveCount(1);
    await expect(confirmForm.locator('input[name="admin_confirm_player_delete"][value="1"]')).toHaveCount(1);
    await expect(confirmForm.locator('input[name="ultrastats_csrf"]')).toHaveCount(1);
    await expect(page.locator('a[href*="verify=yes"]')).toHaveCount(0);
    const confirmSubmit = confirmForm.locator('button[type="submit"][aria-label]').first();
    await expect(confirmSubmit).toHaveAttribute('aria-label', /\S+/);
    await expect(confirmSubmit.locator('img[src*="images/icons/check.png"]')).toHaveAttribute('alt', '');
    await expect(confirmSubmit.locator('img[src*="images/icons/check.png"]')).toHaveAttribute('aria-hidden', 'true');

    const backLink = page.locator('a.us-history-back[href*="players.php"]').first();
    await expect(backLink).toHaveAttribute('aria-label', /\S+/);
    await expect(backLink.locator('img[src*="images/icons/redo.png"]')).toHaveAttribute('alt', '');
    await expect(backLink.locator('img[src*="images/icons/redo.png"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('admin players rejects POST delete without valid CSRF token', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const resp = await page.request.post('/admin/players.php', {
      form: {
        op: 'delete',
        id: '99999',
        admin_confirm_player_delete: '1',
        playerfilter: '',
        start: '0',
        ultrastats_csrf: '__invalid_csrf_token__',
      },
    });
    expect(resp.status(), 'CSRF rejection should return HTTP 200 HTML error page').toBeLessThan(500);
    const body = await resp.text();
    expect(body).toMatch(/invalid session security token/i);
    expect(body.toLowerCase()).not.toContain('fatal error');
  });

  test('admin stringeditor rejects POST delete without valid CSRF token', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const resp = await page.request.post('/admin/stringeditor.php', {
      form: {
        op: 'delete',
        id: '__no_such_string__',
        lang: 'en',
        admin_confirm_string_delete: '1',
        strfilter: '',
        start: '0',
        ultrastats_csrf: '__invalid_csrf_token__',
      },
    });
    expect(resp.status(), 'CSRF rejection should return HTTP 200 HTML error page').toBeLessThan(500);
    const body = await resp.text();
    expect(body).toMatch(/invalid session security token/i);
    expect(body.toLowerCase()).not.toContain('fatal error');
  });

  test('admin users rejects POST delete without valid CSRF token', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    await page.goto('/admin/users.php');
    const resp = await page.request.post('/admin/users.php', {
      form: {
        op: 'delete',
        id: '99999',
        admin_confirm_delete: '1',
        ultrastats_csrf: '__invalid_csrf_token__',
      },
    });
    expect(resp.status(), 'CSRF rejection should return HTTP 200 HTML error page').toBeLessThan(500);
    const body = await resp.text();
    expect(body).toMatch(/invalid session security token/i);
    expect(body.toLowerCase()).not.toContain('fatal error');
  });

  test('admin users delete confirm uses POST CSRF-backed form when a second row exists', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const usersRows = await page.locator('a[href*="users.php?op=delete&id="]:has(img[src*="images/icons/delete.png"])').count();
    test.skip(usersRows < 2, 'Need at least two user rows to confirm delete without locking out the only admin by mistake.');

    const secondDelete = page.locator('a[href*="users.php?op=delete&id="]:has(img[src*="images/icons/delete.png"])').nth(1);
    await secondDelete.click();
    await expectNoPhpRuntimeErrors(page);

    const confirmForm = page.locator('form[name="confirmform"][method="post"]');
    await expect(confirmForm).toHaveCount(1);
    await expect(confirmForm).toHaveAttribute('action', /users\.php$/i);

    await expect(page.locator('input[name="ultrastats_csrf"]').first()).toHaveAttribute('name', 'ultrastats_csrf');
    const csrfLen = await page.locator('input[name="ultrastats_csrf"]').first().getAttribute('value');
    expect(csrfLen && csrfLen.length).toBeGreaterThan(16);

    await expect(page.locator('input[name="admin_confirm_delete"][value="1"]')).toHaveCount(1);
    await expect(page.locator('input[name="op"][value="delete"]')).toHaveCount(1);
    await expect(page.locator('a[href*="verify=yes"]')).toHaveCount(0);
    await expect(page.locator('a.us-history-back[href="users.php"][aria-label]').first()).toHaveCount(1);
  });

  test('admin users list keeps non-destructive action label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const usersResponse = await page.goto('/admin/users.php');
    expect(usersResponse, 'no response for /admin/users.php').not.toBeNull();
    expect(usersResponse!.status(), 'unexpected status for /admin/users.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('a[href*="users.php?op=edit&id="]:has(img[src*="images/icons/edit.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="users.php?op=delete&id="]:has(img[src*="images/icons/delete.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="users.php?op=delete&id="].us-confirm-nav').first()).toHaveAttribute('data-confirm-message', /\S+/);
    await expect(page.locator('a[href="users.php?op=add"]').first()).toHaveAttribute('aria-label', /\S+/);

    await expect(page.locator('a[href*="users.php?op=edit&id="] img[src*="images/icons/edit.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="users.php?op=delete&id="] img[src*="images/icons/delete.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href="users.php?op=add"] img[src*="images/icons/add.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);

    const addResponse = await page.goto('/admin/users.php?op=add');
    expect(addResponse, 'no response for /admin/users.php add view').not.toBeNull();
    expect(addResponse!.status(), 'unexpected status for /admin/users.php add view').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const userFormFields = [
      ['admin-user-username', 'username'],
      ['admin-user-password1', 'password1'],
      ['admin-user-password2', 'password2'],
    ] as const;
    for (const [id, name] of userFormFields) {
      await expect(page.locator(`#${id}[name="${name}"]`), `${name} should keep its field name and stable id`).toHaveCount(1);
      await expect(page.locator(`label[for="${id}"]`), `${name} should have an associated label`).toHaveCount(1);
    }
    await expect(page.locator('#admin-user-username')).toHaveAttribute('required', '');
    await expect(page.locator('#admin-user-username')).toHaveAttribute('autocomplete', 'username');
    await expect(page.locator('#admin-user-password1')).toHaveAttribute('autocomplete', 'new-password');
    await expect(page.locator('#admin-user-password2')).toHaveAttribute('autocomplete', 'new-password');
    await expect(page.locator('#admin-user-password1[required]')).toHaveCount(0);
    await expect(page.locator('#admin-user-password2[required]')).toHaveCount(0);

    await page.goto('/admin/users.php');
    const firstEditHref = await page.locator('a[href*="users.php?op=edit&id="]').first().getAttribute('href');
    if (firstEditHref) {
      const editResponse = await page.goto(`/admin/${firstEditHref}`);
      expect(editResponse, 'no response for /admin/users.php edit view').not.toBeNull();
      expect(editResponse!.status(), 'unexpected status for /admin/users.php edit view').toBeLessThan(500);
      await expectNoPhpRuntimeErrors(page);
      for (const [id, name] of userFormFields) {
        await expect(page.locator(`#${id}[name="${name}"]`), `${name} should keep its field name on edit`).toHaveCount(1);
      }
      await expect(page.locator('#admin-user-password1[required]')).toHaveCount(0);
      await expect(page.locator('#admin-user-password2[required]')).toHaveCount(0);
    }
  });

  test('admin servers list keeps non-destructive action label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const serversResponse = await page.goto('/admin/servers.php');
    expect(serversResponse, 'no response for /admin/servers.php').not.toBeNull();
    expect(serversResponse!.status(), 'unexpected status for /admin/servers.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('a[href*="servers.php?op=edit&id="]:has(img[src*="images/icons/edit.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="parser.php?op=delete&id="]:has(img[src*="images/icons/delete.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="parser.php?op=delete&id="].us-confirm-nav').first()).toHaveAttribute('data-confirm-message', /\S+/);
    await expect(page.locator('a[href*="parser.php?op=resetlastlogline&id="].us-confirm-nav').first()).toHaveAttribute('data-confirm-message', /\S+/);
    await expect(page.locator('a[href*="parser.php?op=deletestats&id="].us-confirm-nav').first()).toHaveAttribute('data-confirm-message', /\S+/);
    await expect(page.locator('a[href*="parser.php?op=updatestats&id="]:has(img[src*="images/icons/gears_run.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href="servers.php?op=add"]').first()).toHaveAttribute('aria-label', /\S+/);

    await expect(page.locator('a[href*="servers.php?op=edit&id="] img[src*="images/icons/edit.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="parser.php?op=delete&id="] img[src*="images/icons/delete.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="parser.php?op=updatestats&id="] img[src*="images/icons/gears_run.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href="servers.php?op=add"] img[src*="images/icons/add.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);

    const addResponse = await page.goto('/admin/servers.php?op=add');
    expect(addResponse, 'no response for /admin/servers.php add view').not.toBeNull();
    expect(addResponse!.status(), 'unexpected status for /admin/servers.php add view').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const serverFormFields = [
      ['admin-server-name', 'servername'],
      ['admin-server-ip', 'serverip'],
      ['admin-server-port', 'port'],
      ['admin-server-description', 'description'],
      ['admin-server-modname', 'modname'],
      ['admin-server-adminname', 'adminname'],
      ['admin-server-clanname', 'clanname'],
      ['admin-server-adminemail', 'adminemail'],
      ['admin-server-gameloglocation', 'gameloglocation'],
      ['admin-server-remotegameloglocation', 'remotegameloglocation'],
      ['admin-server-ftppassiveenabled', 'ftppassiveenabled'],
      ['admin-server-logo', 'serverlogo'],
      ['admin-server-enabled', 'serverenabled'],
      ['admin-server-parsingenabled', 'parsingenabled'],
    ] as const;
    for (const [id, name] of serverFormFields) {
      await expect(page.locator(`#${id}[name="${name}"]`), `${name} should keep its field name and stable id`).toHaveCount(1);
      await expect(page.locator(`label[for="${id}"]`), `${name} should have an associated label`).toHaveCount(1);
    }
    await expect(page.locator('#admin-server-name')).toHaveAttribute('required', '');
    await expect(page.locator('#admin-server-ip')).toHaveAttribute('required', '');
    await expect(page.locator('#admin-server-ip')).toHaveAttribute('maxlength', '16');
    await expect(page.locator('#admin-server-port')).toHaveAttribute('type', 'number');
    await expect(page.locator('#admin-server-port')).toHaveAttribute('min', '0');
    await expect(page.locator('#admin-server-port')).toHaveAttribute('max', '65534');
    await expect(page.locator('#admin-server-port')).toHaveAttribute('required', '');
    await expect(page.locator('#admin-server-gameloglocation')).toHaveAttribute('required', '');

    await page.goto('/admin/servers.php');
    const firstEditHref = await page.locator('a[href*="servers.php?op=edit&id="]').first().getAttribute('href');
    if (firstEditHref) {
      const editResponse = await page.goto(`/admin/${firstEditHref}`);
      expect(editResponse, 'no response for /admin/servers.php edit view').not.toBeNull();
      expect(editResponse!.status(), 'unexpected status for /admin/servers.php edit view').toBeLessThan(500);
      for (const [id, name] of serverFormFields) {
        await expect(page.locator(`#${id}[name="${name}"]`), `${name} should keep its field name on edit`).toHaveCount(1);
      }
      await expect(page.locator('input.us-open-popup[data-popup-url*="servers-ftpbuilder.php?id="]').first()).toHaveCount(1);

      const currentGameLogLocation = await page.locator('#admin-server-gameloglocation').inputValue();
      await page.locator('form input[type="submit"]').click();
      await expectNoPhpRuntimeErrors(page);
      await expect(page).toHaveURL(/\/admin\/result\.php\?/);
      await expect(page.locator('.ErrorMsg .PriorityError')).toHaveCount(0);

      await page.goto(`/admin/${firstEditHref}`);
      await page.locator('#admin-server-gameloglocation').fill(currentGameLogLocation);
      await expect(page.locator('#admin-server-gameloglocation')).toHaveValue(currentGameLogLocation);

      await page.locator('#admin-server-gameloglocation').fill('/definitely-not-writable/ultrastats/server.log');
      await page.locator('form input[type="submit"]').click();
      await expectNoPhpRuntimeErrors(page);
      await expect(page.locator('.ErrorMsg[role="alert"][aria-live="assertive"] .PriorityError')).toBeVisible();
    }
  });

  test('admin FTP builder preview uses delegated input handler', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const serversResponse = await page.goto('/admin/servers.php');
    expect(serversResponse, 'no response for /admin/servers.php').not.toBeNull();
    expect(serversResponse!.status(), 'unexpected status for /admin/servers.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const firstEditHref = await page.locator('a[href*="servers.php?op=edit&id="]').first().getAttribute('href');
    test.skip(!firstEditHref, 'No editable server row available for FTP builder smoke.');

    const editResponse = await page.goto(`/admin/${firstEditHref!}`);
    expect(editResponse, 'no response for /admin/servers.php edit view').not.toBeNull();
    expect(editResponse!.status(), 'unexpected status for /admin/servers.php edit view').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const builderButton = page.locator('input.us-open-popup[data-popup-url*="servers-ftpbuilder.php?id="]').first();
    await expect(builderButton).toHaveCount(1);
    const builderUrl = await builderButton.getAttribute('data-popup-url');
    expect(builderUrl, 'FTP builder popup URL should be present').toBeTruthy();

    const builderResponse = await page.goto(`/admin/${builderUrl!}`);
    expect(builderResponse, 'no response for /admin/servers-ftpbuilder.php').not.toBeNull();
    expect(builderResponse!.status(), 'unexpected status for /admin/servers-ftpbuilder.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('script:not([src])')).toHaveCount(0);
    await expect(page.locator('.us-admin-ftpbuilder-position[data-popup-center-width="500"][data-popup-center-height="500"]')).toHaveCount(1);
    const ftpForm = page.locator('form[name="ftpcheck"].us-ftp-builder-form');
    await expect(ftpForm).toHaveCount(1);
    await expect(page.locator('input.us-admin-ftpbuilder-close')).toHaveCount(0);
    expect(await page.evaluate(() => typeof (window as any).UltraStatsUI?.UltraStatsAdminCloseFtpBuilderPopup)).toBe(
      'function',
    );

    const ftpFields = ['serverip', 'serverport', 'username', 'password', 'pathtogamelog', 'gamelogfilename'];
    for (const fieldName of ftpFields) {
      const field = ftpForm.locator(`input[name="${fieldName}"]`);
      await expect(field).toHaveCount(1);
      expect(await field.getAttribute('onkeyup'), `${fieldName} should not use inline onkeyup`).toBeNull();
    }

    await ftpForm.locator('input[name="serverip"]').fill('192.0.2.55');
    await ftpForm.locator('input[name="serverport"]').fill('2121');
    await ftpForm.locator('input[name="username"]').fill('demo');
    await ftpForm.locator('input[name="password"]').fill('secret');
    await ftpForm.locator('input[name="pathtogamelog"]').fill('/logs/');
    await ftpForm.locator('input[name="gamelogfilename"]').fill('server.log');

    await expect(page.locator('#preview')).toHaveText('ftp://demo:secret@192.0.2.55:2121/logs/server.log');
    expect(
      await page.evaluate(() => document.getElementById('preview')?.innerHTML),
      'FTP preview should be plain text, not interpreted HTML',
    ).toBe('ftp://demo:secret@192.0.2.55:2121/logs/server.log');
    expect(await page.evaluate(() => typeof (window as any).UltraStatsUI?.updateftpurl)).toBe('function');

    const invalidBuilderResponse = await page.goto('/admin/servers-ftpbuilder.php?id=999999');
    expect(invalidBuilderResponse, 'no response for invalid FTP builder server id').not.toBeNull();
    expect(invalidBuilderResponse!.status(), 'unexpected status for invalid FTP builder server id').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    await expect(page.locator('.ErrorMsg[role="alert"][aria-live="assertive"] .PriorityError')).toBeVisible();
  });

  test('admin stringeditor keeps non-destructive label and action icon contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const stringListResponse = await page.goto('/admin/stringeditor.php');
    expect(stringListResponse, 'no response for /admin/stringeditor.php').not.toBeNull();
    expect(stringListResponse!.status(), 'unexpected status for /admin/stringeditor.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('input#admin-string-filter[name="strfilter"]')).toHaveCount(1);
    await expect(page.locator('input#admin-string-filter[name="strfilter"]')).toHaveAttribute('type', 'text');
    await expect(page.locator('label[for="admin-string-filter"]')).toHaveCount(1);
    await expect(page.locator('a[href="stringeditor.php?op=add"]').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href="stringeditor.php?op=add"] img[src*="images/icons/add.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);

    const editActionLink = page.locator('a[href*="stringeditor.php?op=edit&id="]:has(img[src*="images/icons/edit.png"])').first();
    await expect(editActionLink).toHaveAttribute('aria-label', /\S+/);
    const editHref = await editActionLink.getAttribute('href');
    expect(editHref, 'string editor edit href should be present').toBeTruthy();
    const deleteActionLink = page.locator('a[href*="stringeditor.php"][href*="op=delete"][href*="lang="]:has(img[src*="images/icons/delete.png"])').first();
    await expect(deleteActionLink).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="stringeditor.php"][href*="op=delete"][href*="lang="].us-confirm-nav').first()).toHaveAttribute('data-confirm-message', /\S+/);

    const addFormResponse = await page.goto('/admin/stringeditor.php?op=add');
    expect(addFormResponse, 'no response for /admin/stringeditor.php?op=add').not.toBeNull();
    expect(addFormResponse!.status(), 'unexpected status for /admin/stringeditor.php?op=add').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('input#admin-string-id[name="id"]')).toHaveCount(1);
    await expect(page.locator('input#admin-string-id[name="id"]')).toHaveAttribute('type', 'text');
    await expect(page.locator('input#admin-string-id[name="id"]')).toHaveAttribute('required', '');
    await expect(page.locator('input#admin-string-id[name="id"]')).toHaveAttribute('autocomplete', 'off');
    await expect(page.locator('label[for="admin-string-id"]')).toHaveCount(1);
    await expect(page.locator('select#admin-string-langcode[name="langcode"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-string-langcode"]')).toHaveCount(1);
    await expect(page.locator('textarea#admin-string-text[name="text"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-string-text"]')).toHaveCount(1);

    const editFormResponse = await page.goto(`/admin/${editHref!}`);
    expect(editFormResponse, 'no response for /admin/stringeditor.php edit view').not.toBeNull();
    expect(editFormResponse!.status(), 'unexpected status for /admin/stringeditor.php edit view').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);
    await expect(page.locator('input#admin-string-id[name="id"]')).toHaveAttribute('required', '');
    await expect(page.locator('select#admin-string-langcode[name="langcode"]')).toHaveCount(1);
    await expect(page.locator('textarea#admin-string-text[name="text"]')).toHaveCount(1);
  });

  test('admin index keeps non-destructive general config label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const indexResponse = await page.goto('/admin/index.php');
    expect(indexResponse, 'no response for /admin/index.php').not.toBeNull();
    expect(indexResponse!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('select#admin-gen-lang[name="gen_lang"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-gen-lang"]')).toHaveCount(1);
    await expect(page.locator('select#admin-gen-gameversion[name="gen_gameversion"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-gen-gameversion"]')).toHaveCount(1);
    await expect(page.locator('select#admin-gen-parseby[name="gen_parseby"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-gen-parseby"]')).toHaveCount(1);
    await expect(page.locator('input#admin-gen-phpdebug[name="gen_phpdebug"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-gen-phpdebug"]')).toHaveCount(1);
    await expect(page.locator('input#admin-gen-gzipcompression[name="gen_gzipcompression"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-gen-gzipcompression"]')).toHaveCount(1);
    await expect(page.locator('input#admin-gen-bigselects[name="gen_bigselects"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-gen-bigselects"]')).toHaveCount(1);
    await expect(page.locator('input#admin-gen-maxexecutiontime[name="gen_maxexecutiontime"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-gen-maxexecutiontime"]')).toHaveCount(1);
  });

  test('admin index keeps non-destructive frontend config label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const indexResponse = await page.goto('/admin/index.php');
    expect(indexResponse, 'no response for /admin/index.php').not.toBeNull();
    expect(indexResponse!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('select#admin-web-theme[name="web_theme"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-theme"]')).toHaveCount(1);
    await expect(page.locator('select#admin-web-mainpageplayers[name="web_mainpageplayers"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-mainpageplayers"]')).toHaveCount(1);
    await expect(page.locator('select#admin-web-topplayers[name="web_topplayers"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-topplayers"]')).toHaveCount(1);
    await expect(page.locator('select#admin-web-detaillistsplayers[name="web_detaillistsplayers"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-detaillistsplayers"]')).toHaveCount(1);
    await expect(page.locator('select#admin-web-toprounds[name="web_toprounds"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-toprounds"]')).toHaveCount(1);
    await expect(page.locator('select#admin-web-maxpages[name="web_maxpages"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-maxpages"]')).toHaveCount(1);
    await expect(page.locator('select#admin-web-maxmapsperpage[name="web_maxmapsperpage"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-maxmapsperpage"]')).toHaveCount(1);
    await expect(page.locator('input#admin-web-minkills[name="web_minkills"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-minkills"]')).toHaveCount(1);
    await expect(page.locator('input#admin-web-mintime[name="web_mintime"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-mintime"]')).toHaveCount(1);
    await expect(page.locator('input#admin-web-medals[name="web_medals"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-medals"]')).toHaveCount(1);
    await expect(page.locator('input#admin-web-medals-anti[name="web_medals_anti"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-medals-anti"]')).toHaveCount(1);
    await expect(page.locator('input#admin-prepend-title[name="PrependTitle"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-prepend-title"]')).toHaveCount(1);
    await expect(page.locator('input#admin-ultrastats-logo-url[name="UltrastatsLogoUrl"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-ultrastats-logo-url"]')).toHaveCount(1);
  });

  test('admin index keeps non-destructive parser config label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const indexResponse = await page.goto('/admin/index.php');
    expect(indexResponse, 'no response for /admin/index.php').not.toBeNull();
    expect(indexResponse!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('select#admin-parser-debugmode[name="parser_debugmode"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-parser-debugmode"]')).toHaveCount(1);
    await expect(page.locator('input#admin-parser-disablelastline[name="parser_disablelastline"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-parser-disablelastline"]')).toHaveCount(1);
    await expect(page.locator('input#admin-parser-chatlogging[name="parser_chatlogging"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-parser-chatlogging"]')).toHaveCount(1);
  });

  test('admin index keeps non-destructive player details label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const indexResponse = await page.goto('/admin/index.php');
    expect(indexResponse, 'no response for /admin/index.php').not.toBeNull();
    expect(indexResponse!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('select#admin-web-playermodel-killer[name="web_playermodel_killer"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-playermodel-killer"]')).toHaveCount(1);
    await expect(page.locator('select#admin-web-playermodel-killedby[name="web_playermodel_killedby"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-web-playermodel-killedby"]')).toHaveCount(1);
  });

  test('admin index keeps non-destructive medal group toggle label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const indexResponse = await page.goto('/admin/index.php');
    expect(indexResponse, 'no response for /admin/index.php').not.toBeNull();
    expect(indexResponse!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);
    await expect(page.locator('script:not([src])')).toHaveCount(0);
    await expect(page.locator('#medal-autorecalc-status')).toHaveAttribute('data-recalc-url', 'parser-sse.php?op=calcmedalsonly');

    const proToggle = page.locator('input#admin-medal-group-pro.us-medal-group-toggle[data-us-medal-group="pro"]');
    const antiToggle = page.locator('input#admin-medal-group-anti.us-medal-group-toggle[data-us-medal-group="anti"]');
    const customToggle = page.locator('input#admin-medal-group-custom.us-medal-group-toggle[data-us-medal-group="custom"]');

    const proCount = await proToggle.count();
    const antiCount = await antiToggle.count();
    const customCount = await customToggle.count();
    test.skip(proCount + antiCount + customCount === 0, 'No medal group toggles rendered for current config.');

    if (proCount > 0) {
      await expect(proToggle).toHaveCount(1);
      await expect(page.locator('label[for="admin-medal-group-pro"]')).toHaveCount(1);
    }
    if (antiCount > 0) {
      await expect(antiToggle).toHaveCount(1);
      await expect(page.locator('label[for="admin-medal-group-anti"]')).toHaveCount(1);
    }
    if (customCount > 0) {
      await expect(customToggle).toHaveCount(1);
      await expect(page.locator('label[for="admin-medal-group-custom"]')).toHaveCount(1);
    }
  });

  test('admin index keeps non-destructive medal checkbox label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const indexResponse = await page.goto('/admin/index.php');
    expect(indexResponse, 'no response for /admin/index.php').not.toBeNull();
    expect(indexResponse!.status(), 'unexpected status for /admin/index.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const medalCheckboxes = page.locator('input.us-medal-cb[data-us-medal-group]');
    const checkboxCount = await medalCheckboxes.count();
    test.skip(checkboxCount === 0, 'No medal checkboxes rendered for current config.');

    const sampleCount = Math.min(checkboxCount, 6);
    for (let i = 0; i < sampleCount; i += 1) {
      const checkbox = medalCheckboxes.nth(i);
      const checkboxId = await checkbox.getAttribute('id');
      expect(checkboxId, 'medal checkbox should expose id').toBeTruthy();
      expect(checkboxId!, 'medal checkbox id should use stable prefix').toMatch(/^admin-medal-cb-/);
      await expect(page.locator(`label[for="${checkboxId!}"]`)).toHaveCount(1);
    }
  });

  test('admin upgrade keeps non-destructive action link and error alert contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const upgradeResponse = await page.goto('/admin/upgrade.php');
    expect(upgradeResponse, 'no response for /admin/upgrade.php').not.toBeNull();
    expect(upgradeResponse!.status(), 'unexpected status for /admin/upgrade.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const startUpgradeLink = page.locator('a[href="?op=upgrade"]').first();
    const startUpgradeCount = await startUpgradeLink.count();
    if (startUpgradeCount > 0) {
      await expect(startUpgradeLink).toHaveAttribute('aria-label', /\S+/);
    }

    const backToAdminLinks = page.locator('a[href="index.php"]');
    const backCount = await backToAdminLinks.count();
    for (let i = 0; i < backCount; i += 1) {
      await expect(backToAdminLinks.nth(i)).toHaveAttribute('aria-label', /\S+/);
    }

    const errorAlertBoxes = page.locator('td.ErrorMsg[role="alert"][aria-live="assertive"]');
    const errorAlertCount = await errorAlertBoxes.count();
    if (errorAlertCount > 0) {
      await expect(errorAlertBoxes.first()).toBeVisible();
      await expect(errorAlertBoxes.first()).toContainText(/\S+/);
      await expect(errorAlertBoxes.first()).toContainText(ADMIN_ERROR_PATTERN_CORE);
      await expect(errorAlertBoxes.first()).toContainText(ADMIN_UPGRADE_ERROR_PATTERN);
      await expect(page.locator('a.us-history-back[href="index.php"][aria-label]').first()).toHaveCount(1);
    }
  });

  test('admin parser keeps non-destructive server tool label contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const parserResponse = await page.goto('/admin/parser.php?op=foo&id=1');
    expect(parserResponse, 'no response for /admin/parser.php?op=foo&id=1').not.toBeNull();
    expect(parserResponse!.status(), 'unexpected status for /admin/parser.php?op=foo&id=1').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const serverListLink = page.locator('a[href="servers.php"]').first();
    await expect(serverListLink).toHaveAttribute('aria-label', /\S+/);

    await expect(page.locator('a[href*="servers.php?op=edit&id="]:has(img[src*="images/icons/edit.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="parser.php?op=delete&id="]:has(img[src*="images/icons/delete.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href*="parser.php?op=updatestats&id="]:has(img[src*="images/icons/gears_run.png"])').first()).toHaveAttribute('aria-label', /\S+/);

    await expect(page.locator('a[href*="servers.php?op=edit&id="] img[src*="images/icons/edit.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="parser.php?op=delete&id="] img[src*="images/icons/delete.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="parser.php?op=updatestats&id="] img[src*="images/icons/gears_run.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
  });

  test('classic parser destructive confirmations use nonce-backed links', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const serversResponse = await page.goto('/admin/servers.php');
    expect(serversResponse, 'no response for /admin/servers.php').not.toBeNull();
    expect(serversResponse!.status(), 'unexpected status for /admin/servers.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const deleteHref = await page
      .locator('a[href*="parser.php?op=delete&id="]:has(img[src*="images/icons/delete.png"])')
      .first()
      .getAttribute('href');
    test.skip(!deleteHref, 'No parser delete link rendered for current server list.');

    const serverId = deleteHref!.match(/[?&]id=(\d+)/)?.[1];
    test.skip(!serverId, 'Could not extract a server id from parser delete link.');

    for (const operation of ['delete', 'deletestats', 'resetlastlogline'] as const) {
      const response = await page.goto(`/admin/parser-core.php?op=${operation}&id=${serverId}`);
      expect(response, `no response for parser-core ${operation} confirmation`).not.toBeNull();
      expect(response!.status(), `unexpected status for parser-core ${operation} confirmation`).toBeLessThan(500);
      await expectNoPhpRuntimeErrors(page);

      await expect(page.locator('a[href*="verify=yes"]'), `${operation} should not expose legacy verify=yes links`).toHaveCount(0);
      const confirmLink = page.locator(`a[href*="parser-core.php?op=${operation}"][href*="id=${serverId}"][href*="parser_confirm_nonce="]`).first();
      await expect(confirmLink, `${operation} confirmation should expose a nonce-backed Yes link`).toHaveCount(1);
      const confirmHref = await confirmLink.getAttribute('href');
      expect(confirmHref, `${operation} confirmation href should be present`).toBeTruthy();
      expect(confirmHref!, `${operation} confirmation should include exactly one parser nonce`).toMatch(
        /^parser-core\.php\?op=[a-z]+&id=\d+&parser_confirm_nonce=[A-Fa-f0-9]{32}$/,
      );

      await expect(page.locator('a.us-history-back[href="parser.php"][aria-label]').first()).toHaveCount(1);
    }
  });

  test('parser SSE destructive confirmations emit nonce-backed payloads', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const serversResponse = await page.goto('/admin/servers.php');
    expect(serversResponse, 'no response for /admin/servers.php').not.toBeNull();
    expect(serversResponse!.status(), 'unexpected status for /admin/servers.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const deleteHref = await page
      .locator('a[href*="parser.php?op=delete&id="]:has(img[src*="images/icons/delete.png"])')
      .first()
      .getAttribute('href');
    test.skip(!deleteHref, 'No parser delete link rendered for current server list.');

    const serverId = deleteHref!.match(/[?&]id=(\d+)/)?.[1];
    test.skip(!serverId, 'Could not extract a server id from parser delete link.');

    for (const operation of ['delete', 'deletestats', 'resetlastlogline'] as const) {
      const response = await page.request.get(`/admin/parser-sse.php?op=${operation}&id=${serverId}`);
      expect(response.status(), `unexpected status for parser-sse ${operation} confirmation`).toBeLessThan(500);
      expect(response.headers()['content-type'] ?? '', `${operation} should be served as SSE`).toContain(
        'text/event-stream',
      );
      const body = await response.text();
      expect(body, `${operation} SSE should not expose legacy verify=yes links`).not.toContain('verify=yes');
      expect(body, `${operation} SSE should emit confirm_action`).toContain('event: confirm_action');
      expect(body, `${operation} SSE should include a nonce-backed confirmUrl`).toMatch(
        new RegExp(
          `"confirmUrl":"parser-sse\\.php\\?op=${operation}&id=${serverId}&parser_confirm_nonce=[A-Fa-f0-9]{32}"`,
        ),
      );
    }
  });

  test('embedded parser confirm panel resumes with nonce-backed EventSource URL', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const serversResponse = await page.goto('/admin/servers.php');
    expect(serversResponse, 'no response for /admin/servers.php').not.toBeNull();
    expect(serversResponse!.status(), 'unexpected status for /admin/servers.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const deleteHref = await page
      .locator('a[href*="parser.php?op=delete&id="]:has(img[src*="images/icons/delete.png"])')
      .first()
      .getAttribute('href');
    test.skip(!deleteHref, 'No parser delete link rendered for current server list.');

    const serverId = deleteHref!.match(/[?&]id=(\d+)/)?.[1];
    test.skip(!serverId, 'Could not extract a server id from parser delete link.');

    await page.addInitScript(() => {
      const win = window as unknown as {
        __usEventSourceUrls?: string[];
        __usEventSourceInstances?: Array<{
          url: string;
          readyState: number;
          listeners: Record<string, Array<(ev: { data: string }) => void>>;
          addEventListener: (type: string, cb: (ev: { data: string }) => void) => void;
          close: () => void;
          emit: (type: string, payload: unknown) => void;
        }>;
        EventSource: typeof EventSource;
      };
      win.__usEventSourceUrls = [];
      win.__usEventSourceInstances = [];
      class MockEventSource {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSED = 2;
        url: string;
        readyState = MockEventSource.OPEN;
        listeners: Record<string, Array<(ev: { data: string }) => void>> = {};
        constructor(url: string) {
          this.url = String(url);
          win.__usEventSourceUrls!.push(this.url);
          win.__usEventSourceInstances!.push(this);
        }
        addEventListener(type: string, cb: (ev: { data: string }) => void) {
          (this.listeners[type] ||= []).push(cb);
        }
        close() {
          this.readyState = MockEventSource.CLOSED;
        }
        emit(type: string, payload: unknown) {
          const ev = { data: JSON.stringify(payload) };
          for (const cb of this.listeners[type] || []) {
            cb(ev);
          }
        }
      }
      win.EventSource = MockEventSource as unknown as typeof EventSource;
    });

    const parserResponse = await page.goto(`/admin/parser.php?op=delete&id=${serverId}`);
    expect(parserResponse, 'no response for mocked embedded parser delete view').not.toBeNull();
    expect(parserResponse!.status(), 'unexpected status for mocked embedded parser delete view').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    await page.waitForFunction(() => {
      const win = window as unknown as { __usEventSourceInstances?: unknown[] };
      return (win.__usEventSourceInstances || []).length > 0;
    });

    const confirmUrl = `parser-sse.php?op=delete&id=${serverId}&parser_confirm_nonce=1234567890abcdef1234567890abcdef`;
    await page.evaluate((url) => {
      const win = window as unknown as {
        __usEventSourceInstances: Array<{ emit: (type: string, payload: unknown) => void }>;
      };
      win.__usEventSourceInstances[0].emit('confirm_action', {
        t: 'confirm',
        warning: 'Confirm mocked delete',
        confirmUrl: url,
        confirmLabel: 'Yes',
        cancelLabel: 'No',
      });
    }, confirmUrl);

    const confirmBox = page.locator('#parser-confirm-box.us-parser-confirm-banner');
    await expect(confirmBox).toBeVisible();
    await expect(confirmBox).toHaveAttribute('role', 'alert');
    await expect(confirmBox.locator('button.us-parser-confirm-yes')).toHaveAttribute('aria-label', 'Yes');
    await expect(confirmBox.locator('button.us-parser-confirm-no')).toHaveAttribute('aria-label', 'No');

    await confirmBox.locator('button.us-parser-confirm-yes').click();
    await page.waitForFunction((url) => {
      const win = window as unknown as { __usEventSourceUrls?: string[] };
      return (win.__usEventSourceUrls || []).includes(url as string);
    }, confirmUrl);

    const eventSourceUrls = await page.evaluate(() => {
      const win = window as unknown as { __usEventSourceUrls?: string[] };
      return win.__usEventSourceUrls || [];
    });
    expect(eventSourceUrls[0]).toBe(`parser-sse.php?op=delete&id=${serverId}`);
    expect(eventSourceUrls).toContain(confirmUrl);
  });

  test('admin login keeps non-destructive label and error alert contract', async ({ page }) => {
    const loginResponse = await page.goto('/admin/login.php');
    expect(loginResponse, 'no response for /admin/login.php').not.toBeNull();
    expect(loginResponse!.status(), 'unexpected status for /admin/login.php').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('input#admin-login-uname[name="uname"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-login-uname"]')).toHaveCount(1);
    await expect(page.locator('input#admin-login-pass[name="pass"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-login-pass"]')).toHaveCount(1);

    const rememberMe = page.locator('input#admin-login-rememberme[name="rememberme"]');
    const rememberMeCount = await rememberMe.count();
    if (rememberMeCount > 0) {
      await expect(rememberMe).toBeDisabled();
      await expect(page.locator('label[for="admin-login-rememberme"]')).toHaveCount(1);
    }

    const invalidResponse = await page.goto('/admin/login.php?op=login');
    expect(invalidResponse, 'no response for /admin/login.php?op=login').not.toBeNull();
    expect(invalidResponse!.status(), 'unexpected status for /admin/login.php?op=login').toBeLessThan(500);
    const errorBox = page.locator('.ErrorMsg[role="alert"][aria-live="assertive"]').first();
    const errorCount = await errorBox.count();
    if (errorCount > 0) {
      await expect(errorBox).toBeVisible();
      await expect(errorBox).toContainText(/\S+/);
      await expect(errorBox).toContainText(ADMIN_ERROR_PATTERN_CORE);
      await expect(errorBox).toContainText(ADMIN_LOGIN_ERROR_PATTERN);
    }
  });

  test('admin stringeditor delete verify keeps non-destructive action labels', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const listResponse = await page.goto('/admin/stringeditor.php');
    expect(listResponse, 'no response for /admin/stringeditor.php').not.toBeNull();
    expect(listResponse!.status(), 'unexpected status for /admin/stringeditor.php').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const deleteLink = page.locator('a[href*="stringeditor.php"][href*="op=delete"][href*="lang="]:has(img[src*="images/icons/delete.png"])').first();
    await expect(deleteLink).toBeVisible();
    const deleteHref = await deleteLink.getAttribute('href');
    expect(deleteHref, 'delete href should be present').toBeTruthy();

    const verifyResponse = await page.goto(`/admin/${deleteHref!}`);
    expect(verifyResponse, 'no response for stringeditor delete verify view').not.toBeNull();
    expect(verifyResponse!.status(), 'unexpected status for stringeditor delete verify view').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const confirmForm = page.locator('form[action="stringeditor.php"][method="post"]').first();
    await expect(confirmForm.locator('input[name="op"][value="delete"]')).toHaveCount(1);
    await expect(confirmForm.locator('input[name="admin_confirm_string_delete"][value="1"]')).toHaveCount(1);
    await expect(confirmForm.locator('input[name="ultrastats_csrf"]')).toHaveCount(1);
    await expect(page.locator('a[href*="verify=yes"]')).toHaveCount(0);
    const confirmSubmit = confirmForm.locator('button[type="submit"][aria-label]').first();
    await expect(confirmSubmit).toHaveAttribute('aria-label', /\S+/);
    await expect(confirmSubmit.locator('img[src*="images/icons/check.png"]')).toHaveAttribute('alt', '');
    await expect(confirmSubmit.locator('img[src*="images/icons/check.png"]')).toHaveAttribute('aria-hidden', 'true');

    const backLink = page.locator('a.us-history-back[href*="stringeditor.php"]').first();
    await expect(backLink).toHaveAttribute('aria-label', /\S+/);
    await expect(backLink.locator('img[src*="images/icons/redo.png"]')).toHaveAttribute('alt', '');
    await expect(backLink.locator('img[src*="images/icons/redo.png"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('admin parser embed toolbar keeps non-destructive status semantics', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const parserResponse = await page.goto('/admin/parser.php?op=runtotals');
    expect(parserResponse, 'no response for /admin/parser.php?op=runtotals').not.toBeNull();
    expect(parserResponse!.status(), 'unexpected status for /admin/parser.php?op=runtotals').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);
    await expect(page.locator('script:not([src])')).toHaveCount(0);

    await expect(page.locator('.us-parser-embed-toolbar')).toHaveCount(1);
    const streamStatus = page.locator('#parser-stream-status.us-parser-stream-status');
    const statusCount = await streamStatus.count();
    test.skip(statusCount === 0, 'Parser embed toolbar is not rendered for current parser route state.');

    await expect(streamStatus).toHaveAttribute('role', 'status');
    await expect(streamStatus).toHaveAttribute('aria-live', 'polite');

    const cancelButton = page.locator('#parser-cancel-btn.us-parser-cancel-btn');
    await expect(cancelButton).toHaveAttribute('aria-label', /\S+/);
    await expect(cancelButton).toHaveAttribute('aria-controls', 'parser-log-wrap');
  });

  test('admin parser log region keeps non-destructive live semantics', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const parserResponse = await page.goto('/admin/parser.php?op=runtotals');
    expect(parserResponse, 'no response for /admin/parser.php?op=runtotals').not.toBeNull();
    expect(parserResponse!.status(), 'unexpected status for /admin/parser.php?op=runtotals').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const logWrap = page.locator('#parser-log-wrap');
    const logWrapCount = await logWrap.count();
    test.skip(logWrapCount === 0, 'Parser log region is not rendered for current parser route state.');

    await expect(logWrap).toHaveAttribute('role', 'region');
    await expect(logWrap).toHaveAttribute('aria-label', /\S+/);

    const logPre = page.locator('#parser-log-pre');
    await expect(logPre).toHaveAttribute('role', 'log');
    await expect(logPre).toHaveAttribute('aria-live', 'polite');
    await expect(logPre).toHaveAttribute('aria-relevant', 'additions text');
  });

  test('admin parser dynamic panel actions keep accessible labels when rendered', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const parserResponse = await page.goto('/admin/parser.php?op=runtotals');
    expect(parserResponse, 'no response for /admin/parser.php?op=runtotals').not.toBeNull();
    expect(parserResponse!.status(), 'unexpected status for /admin/parser.php?op=runtotals').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    await page.waitForTimeout(1200);

    const doneBannerLink = page.locator('#parser-done-banner a.parser-done-banner-link').first();
    const doneBannerLinkCount = await doneBannerLink.count();
    if (doneBannerLinkCount > 0) {
      await expect(doneBannerLink).toHaveAttribute('aria-label', /\S+/);
    }

    const ftpPanelLink = page.locator('#parser-ftp-password-box a').first();
    const ftpPanelLinkCount = await ftpPanelLink.count();
    if (ftpPanelLinkCount > 0) {
      await expect(ftpPanelLink).toHaveAttribute('aria-label', /\S+/);
    }

    const confirmYesBtn = page.locator('#parser-confirm-box button').first();
    const confirmBtnCount = await confirmYesBtn.count();
    if (confirmBtnCount > 0) {
      await expect(confirmYesBtn).toHaveAttribute('aria-label', /\S+/);
      await expect(page.locator('#parser-confirm-box button').nth(1)).toHaveAttribute('aria-label', /\S+/);
    }
  });

  test('admin parser invalid request keeps non-destructive error alert text contract', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const parserResponse = await page.goto('/admin/parser.php?op=foo');
    expect(parserResponse, 'no response for /admin/parser.php?op=foo').not.toBeNull();
    expect(parserResponse!.status(), 'unexpected status for /admin/parser.php?op=foo').toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
    await expectNoPhpRuntimeErrors(page);

    const errorBox = page.locator('.ErrorMsg[role="alert"][aria-live="assertive"]').first();
    await expect(errorBox).toHaveCount(1);
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText(/\S+/);
    await expect(errorBox).toContainText(ADMIN_ERROR_PATTERN_CORE);
    await expect(errorBox).toContainText(ADMIN_PARSER_ERROR_PATTERN);

    const missingServerResponse = await page.goto('/admin/parser.php?op=updatestats&id=999999');
    expect(missingServerResponse, 'no response for /admin/parser.php missing server id').not.toBeNull();
    expect(missingServerResponse!.status(), 'unexpected status for /admin/parser.php missing server id').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    const missingServerErrorBox = page.locator('.ErrorMsg[role="alert"][aria-live="assertive"]').first();
    await expect(missingServerErrorBox).toHaveCount(1);
    await expect(missingServerErrorBox).toBeVisible();
    await expect(missingServerErrorBox).toContainText('999999');
    await expect(missingServerErrorBox).toContainText(/server|id|not found/i);
  });

  test('classic parser shell uses shared JS for autoscroll without inline script', async ({ page }) => {
    await page.goto('/admin/login.php');
    const loginInputVisible = await page
      .locator('input[name="uname"]')
      .first()
      .isVisible()
      .catch(() => false);
    test.skip(!loginInputVisible, 'Admin smoke requires an installed app and reachable login form.');

    await loginAsAdmin(page);

    const parserResponse = await page.goto('/admin/parser-core.php?op=foo&id=1');
    expect(parserResponse, 'no response for /admin/parser-core.php?op=foo&id=1').not.toBeNull();
    expect(parserResponse!.status(), 'unexpected status for /admin/parser-core.php?op=foo&id=1').toBeLessThan(500);
    await expect(page.locator('body[data-parser-autoscroll="true"]')).toHaveCount(1);
    await expect(page.locator('script[src$="/js/common.js"], script[src="../js/common.js"]')).toHaveCount(1);
    await expect(page.locator('script:not([src])')).toHaveCount(0);
    await expectNoPhpRuntimeErrors(page);
  });
});
