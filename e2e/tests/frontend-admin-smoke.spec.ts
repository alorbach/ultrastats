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
    }
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
    }

    const configResponse = await page.goto('/admin/index.php');
    expect(configResponse).not.toBeNull();
    await expect(page.locator('form')).toHaveCount(1);
    await expect(page.locator('input[name="gen_lang"], select[name="gen_lang"]')).toHaveCount(1);

    const loginResponse = await page.goto('/admin/login.php?op=logoff');
    expect(loginResponse).not.toBeNull();
    await expect(page.locator('input[name="uname"]')).toBeVisible();
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

    const confirmDeleteLink = page.locator('a[href*="op=delete&id="][href*="verify=yes"]').first();
    await expect(confirmDeleteLink).toHaveAttribute('aria-label', /\S+/);
    await expect(confirmDeleteLink.locator('img[src*="images/icons/check.png"]')).toHaveAttribute('alt', '');
    await expect(confirmDeleteLink.locator('img[src*="images/icons/check.png"]')).toHaveAttribute('aria-hidden', 'true');

    const backLink = page.locator('a[href="javascript:history.back;"]').first();
    await expect(backLink).toHaveAttribute('aria-label', /\S+/);
    await expect(backLink.locator('img[src*="images/icons/redo.png"]')).toHaveAttribute('alt', '');
    await expect(backLink.locator('img[src*="images/icons/redo.png"]')).toHaveAttribute('aria-hidden', 'true');
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
    await expect(page.locator('a[href="users.php?op=add"]').first()).toHaveAttribute('aria-label', /\S+/);

    await expect(page.locator('a[href*="users.php?op=edit&id="] img[src*="images/icons/edit.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="users.php?op=delete&id="] img[src*="images/icons/delete.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href="users.php?op=add"] img[src*="images/icons/add.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
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
    await expect(page.locator('a[href*="parser.php?op=updatestats&id="]:has(img[src*="images/icons/gears_run.png"])').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href="servers.php?op=add"]').first()).toHaveAttribute('aria-label', /\S+/);

    await expect(page.locator('a[href*="servers.php?op=edit&id="] img[src*="images/icons/edit.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="parser.php?op=delete&id="] img[src*="images/icons/delete.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href*="parser.php?op=updatestats&id="] img[src*="images/icons/gears_run.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
    await expect(page.locator('a[href="servers.php?op=add"] img[src*="images/icons/add.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);
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
    await expect(page.locator('label[for="admin-string-filter"]')).toHaveCount(1);
    await expect(page.locator('a[href="stringeditor.php?op=add"]').first()).toHaveAttribute('aria-label', /\S+/);
    await expect(page.locator('a[href="stringeditor.php?op=add"] img[src*="images/icons/add.png"][alt=""][aria-hidden="true"]').first()).toHaveCount(1);

    const editActionLink = page.locator('a[href*="stringeditor.php?op=edit&id="]:has(img[src*="images/icons/edit.png"])').first();
    await expect(editActionLink).toHaveAttribute('aria-label', /\S+/);
    const deleteActionLink = page.locator('a[href*="stringeditor.php"][href*="op=delete"][href*="lang="]:has(img[src*="images/icons/delete.png"])').first();
    await expect(deleteActionLink).toHaveAttribute('aria-label', /\S+/);

    const addFormResponse = await page.goto('/admin/stringeditor.php?op=add');
    expect(addFormResponse, 'no response for /admin/stringeditor.php?op=add').not.toBeNull();
    expect(addFormResponse!.status(), 'unexpected status for /admin/stringeditor.php?op=add').toBeLessThan(500);
    await expectNoPhpRuntimeErrors(page);

    await expect(page.locator('input#admin-string-id[name="id"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-string-id"]')).toHaveCount(1);
    await expect(page.locator('select#admin-string-langcode[name="langcode"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-string-langcode"]')).toHaveCount(1);
    await expect(page.locator('textarea#admin-string-text[name="text"]')).toHaveCount(1);
    await expect(page.locator('label[for="admin-string-text"]')).toHaveCount(1);
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
      await expect(page.locator('a[href="javascript:history.back();"][aria-label]').first()).toHaveCount(1);
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

    const confirmDeleteLink = page.locator('a[href*="stringeditor.php"][href*="op=delete"][href*="verify=yes"]').first();
    await expect(confirmDeleteLink).toHaveAttribute('aria-label', /\S+/);
    await expect(confirmDeleteLink.locator('img[src*="images/icons/check.png"]')).toHaveAttribute('alt', '');
    await expect(confirmDeleteLink.locator('img[src*="images/icons/check.png"]')).toHaveAttribute('aria-hidden', 'true');

    const backLink = page.locator('a[href="javascript:history.back();"]').first();
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

    const streamStatus = page.locator('#parser-stream-status');
    const statusCount = await streamStatus.count();
    test.skip(statusCount === 0, 'Parser embed toolbar is not rendered for current parser route state.');

    await expect(streamStatus).toHaveAttribute('role', 'status');
    await expect(streamStatus).toHaveAttribute('aria-live', 'polite');

    const cancelButton = page.locator('#parser-cancel-btn');
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
  });
});

