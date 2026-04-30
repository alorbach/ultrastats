# Changelog

Release history. The same content is mirrored as **plain text** in `ChangeLog` at the repository root (used by the release workflow); this file is the **maintained Markdown** copy for readers and tools.

---

## Version 0.3.23, 2026-04-30

Shipping label is **0.3.23**; this section lists accumulated changes on that line.

### Changes and bugfixes

- **Frontend/admin modernization closure:** phases 1-7 are complete for the compatibility scope; remaining items are explicitly future/non-goals (framework reskin, route-specific visual redesign, in-app CSP header enforcement, and unproven selector deletion).
- **CSS token closure:** shipped themes now expose `cellmenu*` variables alongside existing shell/title/list/menu tokens, and dynamic parser FTP-password panels use shared CSS classes/tokens instead of inline JS `style.cssText`.
- **Embedded parser confirmation UI coverage:** a mocked-`EventSource` Playwright smoke test emits `confirm_action`, verifies the visible Yes/No panel, and confirms Yes starts a new EventSource with the nonce-backed `confirmUrl` without executing destructive actions.
- **Admin message hardening:** login, upgrade, parser, servers, users, players, string editor, and FTP builder error messages are escaped before template output where applicable and use the established alert/live-region pattern.
- **Admin FTP builder robustness:** invalid server ids now render a normal escaped alert instead of relying on a broken row check; id loading uses a bound query while preserving field names and popup behavior.
- **Responsive layout containment:** narrow public/admin viewports now stack the 400px header logo and selector controls; long public/admin menus, public pagers, dense admin list tables, representative public content/list tables, and player/round detail shells scroll inside their own strips instead of forcing page-level horizontal overflow. Admin summary/config/filter panels and public search/error panels now fit the mobile body chrome.
- **Admin server editor usability:** add/edit server form fields now have stable labels/IDs plus HTML5 hints that mirror existing server-side rules (**`required`** name/IP/port/log path and numeric port bounds) while preserving all field names and POST behavior.
- **Admin user editor usability:** add/edit user form fields now have stable labels/IDs, username autocomplete/required hint, and password autocomplete hints; password fields stay optional in the shared edit form so existing password-change behavior is unchanged.
- **Admin string editor usability:** filter and string ID inputs now use standard text inputs; add/edit string form keeps stable labels/IDs and adds the required/autocomplete-off hint for the string ID while preserving language/text field names.
- **Admin server save validation:** relative game-log paths such as **`gamelogs/cod4_normal.log`** are validated relative to the UltraStats app root, matching parser behavior; uncreatable paths now report the existing validation error instead of throwing a PHP 8 **`fclose(false)`** fatal.
- **Admin server editor messaging:** server validation errors are escaped before template output and the error box now uses alert live-region semantics like the other hardened admin forms.
- **Parser confirmation coverage:** Playwright now asserts classic parser destructive confirmations and embedded parser SSE confirmation payloads expose nonce-backed Yes URLs for delete server, delete stats, and reset last log line, with no legacy **`verify=yes`** links.
- **Admin parser errors:** parser wrapper validation messages are escaped before template output, and the missing-server path now reports the requested ID instead of referencing an undefined variable.
- **JavaScript IE cleanup:** removed active MSIE/Trident-era branches from [`common.js`](../../js/common.js) (`window.event` / `cancelBubble` fallbacks, string-based `setTimeout`, and the Trident-only menu tooltip path). The old **`HoverPopupMenuHelp`** global remains as a no-op shim while modern menu usability relies on CSS flyouts/native titles.
- **Admin index CSP cleanup:** medal group toggles and medal autosave/recalculate logic now run from shared [`common.js`](../../js/common.js) using existing checkbox classes plus **`#medal-autorecalc-status`** data attributes; [`admin/index.html`](../../templates/admin/index.html) no longer embeds inline scripts.
- **Embedded parser CSP cleanup:** the admin [`parser.html`](../../templates/admin/parser.html) **EventSource** UI now runs from shared [`common.js`](../../js/common.js) instead of an inline `<script>` block, preserving SSE event names, cancel flow, resume/run-totals chaining, and dynamic confirm/FTP panels.
- **Classic parser CSP cleanup:** parser-core HTML now loads shared [`common.js`](../../js/common.js); parser autoscroll and resume/run-total auto-reload behavior use **`data-parser-autoscroll`** / **`data-reload-*`** markers instead of inline `<script>` blocks.
- **FTP builder CSP cleanup:** popup centering/focus and saved auto-close now use [`common.js`](../../js/common.js) handlers with **`data-popup-center-*`** / **`data-ftpbuilder-close-delay`** markers; [`servers-ftpbuilder.html`](../../templates/admin/servers-ftpbuilder.html) no longer embeds inline scripts.
- **Template CSP cleanup:** remaining active template event-handler attributes were removed from shared popup panels, public weapon/damage stat bars, and admin server action tooltips; delegated **`.us-popup-help`** / **`.us-popup-panel`** handlers in [`common.js`](../../js/common.js) preserve hover popups while `rg` reports no **`onclick`** / **`onkeyup`** / mouse-hover attributes in templates.
- **Player detail CSP cleanup:** hit-location body-map and killed-by legend hovers in [`players-detail.html`](../../templates/players-detail.html) now use delegated [`common.js`](../../js/common.js) handlers with `data-*` attributes; the repeated inline mouse handlers and page-local `HoverPlayerImage` script were removed while preserving popup/legend behavior.
- **Public menu CSP cleanup:** shared top-menu toggle, timeout-extension, and popup-help behavior moved from inline event attributes in [`include_menu.html`](../../templates/include_menu.html) to delegated [`common.js`](../../js/common.js) handlers backed by `data-*` attributes; smoke asserts the menu has no inline JavaScript handlers and still toggles.
- **Admin navigation polish:** confirmation/error back links in users, players, string editor, upgrade, and parser confirm views now use real fallback URLs plus delegated **`.us-history-back`** behavior instead of **`href="javascript:history.back();"`**.
- **Homepage top players:** the **Played Time** column now stays on one line by scoping a no-wrap/min-width rule to the main top-player table, preventing day/time values from wrapping in narrow dark-theme layouts.
- **Phase 6 (admin UX pilot):** destructive parser operations in the browser (**`delete`**, **`deletestats`**, **`resetlastlogline`** on **`parser-core.php`** / **`parser-sse.php`**) require a single-use **`parser_confirm_nonce`** issued with the confirmation UI; plain **`verify=yes` bookmark links no longer execute** those actions. Keeps **GET** + **EventSource** flows working; **CLI/cron** **`parser-shell.php`** unchanged.
- **Admin users:** confirmed deletes use **POST** + **`ultrastats_csrf`** (**`UltraStats_AdminCsrf*`** in [`functions_common.php`](../../include/functions_common.php)) and **PRG** via **[`result.php`](../../admin/result.php)**; CSRF rotates on login. **[`admin_securecheck.html`](../../templates/admin/admin_securecheck.html)** posts to **`users.php`** without relying on query-string **`verify=yes`**.
- **Embedded parser UI:** confirm banner uses **`defaults.css`** **`us-parser-confirm-*`** helpers and **`--us-parser-confirm-*`** tokens (Phase **6.2** / **4.2** slice).
- **Languages:** **`LN_WARNINGRESETLASTLOGLINE`** (en/de).
- **Docs/tests:** [`docs/admin-destructive-actions-inventory.md`](../../../docs/admin-destructive-actions-inventory.md), [`docs/admin-phase6-manual-confirm-checklist.md`](../../../docs/admin-phase6-manual-confirm-checklist.md); roadmap + **[`template-variable-trust.md`](../../../docs/template-variable-trust.md)** rows; Playwright CSRF rejection case + **`history.back()`** selector fix.
- **Admin players / string editor:** delete confirmation uses **POST** + **`ultrastats_csrf`** (**`admin_confirm_player_delete`** / **`admin_confirm_string_delete`**); **`verify=yes`** no longer runs those deletes. **[`SECURITY.md`](../../../SECURITY.md)** and inventory updated; Playwright covers confirm forms + CSRF rejection for both routes.
- **Phase 1.5:** [`e2e/tests/admin-visual-baseline.spec.ts`](../../../e2e/tests/admin-visual-baseline.spec.ts) — admin index screenshot byte-size guard; optional golden compare when **`ULTRASTATS_ADMIN_VISUAL_BASELINE=1`**.
- **Admin error strips (Phase 6.2):** [`admin/players.html`](../../templates/admin/players.html), [`admin/users.html`](../../templates/admin/users.html), [`admin/stringeditor.html`](../../templates/admin/stringeditor.html) use **`ErrorMsg`** + live region semantics; matching PHP assigns **`UltraStats_h(ERROR_MSG)`** when **`ISERROR`**.
- **CSS:** [`defaults.css`](../../css/defaults.css) — **`--us-parser-debug-grid-bg`**, **`--us-priority-emergency-*`**; **`.us-admin-player-filter-bar`** on admin players list filter row.
- **Admin slim + FTP builder:** [`admin_slim_header.html`](../../templates/admin/admin_slim_header.html) loads **[`common.js`](../../js/common.js)** with **`defer`**; saved FTP builder popup uses **`us-admin-ftpbuilder-close`** + **`UltraStatsAdminCloseFtpBuilderPopup`** instead of inline **`onclick`**.
- **Admin UX polish (Phase 6.3/6.4 slice):** optional browser confirms on GET-first destructive entry links via **`.us-confirm-nav`** (`users`, `players`, `stringeditor`, parser destructive links in `parser`/`servers` screens); server-side confirm/nonce flow remains authoritative.
- **Admin servers edit inline JS reduction:** FTP builder launcher uses delegated popup metadata (**`.us-open-popup`** + `data-popup-*`) in [`servers.html`](../../templates/admin/servers.html) with `common.js` listener (replaces inline `NewWindow(...)` call).
- **Phase 3.3 completion pass:** removed remaining active template inline `style="..."` attributes by reusing utility classes in [`defaults.css`](../../css/defaults.css); parser classic debug shell body color moved to `.us-parser-body`; player-name color output no longer uses `<font>` (now `<span>` in [`functions_common.php`](../../include/functions_common.php)).
- **Phase 4.2 completion (all shipped themes):** tokenized remaining hardcoded color literals in [`defaults.css`](../../css/defaults.css) and [`themes/default/main.css`](../../themes/default/main.css), [`themes/dark/main.css`](../../themes/dark/main.css), [`themes/codww/main.css`](../../themes/codww/main.css) under `:root` variables.
- **Phase 4.3 completion (inner layout only):** parser embed toolbar/status/cancel now use reusable classes (`.us-parser-embed-toolbar`, `.us-parser-stream-status`, `.us-parser-cancel-btn`, `.us-hidden`); additional utility classes (`.us-form-select-*`, `.us-fixed-w-*`, `.us-pad-*`, etc.) replace inline layout styling without outer chrome changes.
- **Phase 4.4 completion (aggressive):** shared outer shell chrome is now classed in public/admin wrappers (`.us-chrome-top`, `.us-chrome-body`, `.us-chrome-footer`) via [`include_header.html`](../../templates/include_header.html), [`include_footer.html`](../../templates/include_footer.html), [`admin_header.html`](../../templates/admin/admin_header.html), [`admin_footer.html`](../../templates/admin/admin_footer.html). [`defaults.css`](../../css/defaults.css) adds responsive shell sizing/radius/shadow (`--us-chrome-*`), with per-theme tuning in shipped theme files.
- **Baseline gate for 4.4:** smoke assertions now check `.us-chrome-*` presence on representative public/admin pages; visual baseline spec adds a public index outer-chrome screenshot guard (strict screenshot compare remains gated by **`ULTRASTATS_ADMIN_VISUAL_BASELINE=1`**).
- **Screenshot matrix (public + admin):** added [`e2e/tests/full-route-visual.spec.ts`](../../../e2e/tests/full-route-visual.spec.ts) to capture full-page artifacts for broad public/admin list+detail routes (including `info-maps.php?id=mp_strike&serverid=2`) with byte-size guards and optional strict compare behind **`ULTRASTATS_ADMIN_VISUAL_BASELINE=1`**.
- **Artifact-driven CSS fixes:** [`info-maps.html`](../../templates/info-maps.html) now uses `us-map-detail-layout`/`us-map-detail-col` responsive classes; [`defaults.css`](../../css/defaults.css) stacks map detail columns on narrow widths and sets `.us-chrome-top/.us-chrome-body/.us-chrome-footer` to `overflow: visible` to avoid chrome clipping regressions.
- **Mobile/narrow viewport sweep (1280/1024/900):** captured a full public/admin screenshot + shell-metrics matrix and triaged shared-shell breakages first; top/menu/pager/body/footer alignment remained stable across sampled routes.
- **Narrow overflow containment:** [`defaults.css`](../../css/defaults.css) now applies a <=1100px shell rule where `.us-chrome-body` becomes a bounded block container with horizontal overflow handling, so dense legacy tables (notably `index.php` and `players.php`) scroll inside body chrome instead of forcing page-level horizontal overflow.
- **Verification:** reran the same 1280/1024/900 matrix post-fix and executed focused smoke checks (`core public routes render without server errors`, `critical admin screens still load with legacy routes`) to confirm compatibility on touched paths.
- **Phase 1 closure (`1.1`–`1.5`):** baseline program is now complete: deeper core public/admin smoke assertions for shell and contract surfaces, mandatory HTML validation suite via [`e2e/tests/html-validation.spec.ts`](../../../e2e/tests/html-validation.spec.ts), completed trust-inventory closure matrix in [`docs/template-variable-trust.md`](../../../docs/template-variable-trust.md), and strict visual snapshot assertions enabled by default (no `ULTRASTATS_ADMIN_VISUAL_BASELINE` gate in baseline specs).
- **Strict snapshot baseline set:** first committed baseline snapshots generated with `--update-snapshots` for win32/chromium under [`e2e/tests/admin-visual-baseline.spec.ts-snapshots`](../../../e2e/tests/admin-visual-baseline.spec.ts-snapshots) and [`e2e/tests/full-route-visual.spec.ts-snapshots`](../../../e2e/tests/full-route-visual.spec.ts-snapshots).
- **userchange.php:** fixed the redirect after using the language, style, or time-filter dropdowns when the site is installed under a **URL subfolder** (the `Location` target is now a single script name under that folder, so the browser no longer resolves a doubled path like `/app/app/players.php` and returns 404). **Same-host** detection for the referer now compares the host part correctly when `HTTP_HOST` includes a **port**.
- **Admin database upgrade:** `database_installedversion` is updated only when **every** SQL statement succeeds. If anything fails, the version stays unchanged and the upgrade page explains that you must fix errors and run upgrade again (avoids a half-applied schema with a “fully upgraded” version).
- **CI / tests:** GitHub Actions **PHP CI** workflow (`php -l` on all `src/**/*.php`, **PHPUnit** for DB string helpers and the bundled CoD4 gamelog fixture); optional dev install via **Composer** (`composer.json`, `vendor/` gitignored).
- **Security (admin result):** [result.php](../../admin/result.php) now sends a **sanitized** meta refresh URL (`UltraStats_SanitizeRedirectTarget`), **HTML-escapes** the flash `msg` and the redirect target embedded in the translated “redirecting…” line, and **caps** the refresh delay. **UltraStats_SanitizeRedirectTarget** also rejects **javascript:** / **data:** style targets, **quotes**, **backslashes**, **angle brackets**, and **control characters** so the same helper stays safe in `Location`, meta refresh, and `href` contexts.
- **Admin UI:** fixed **`javascript:history.back()`** on the admin players list template and the parser helper back link (broken `history.back` without parentheses).
- **Security (error pages):** `DieWithErrorMsg` and `DieWithFriendlyErrorMsg` now HTML-escape error detail text before rendering (line breaks preserved), preventing script/markup execution in error detail output.
- **Security (legacy popup JS):** `src/js/common.js` now writes popup title/content via `textContent` instead of `innerHTML` in `HoverPopup` and `HoverPopupMenuHelp` to reduce DOM injection risk.
- **Tests:** PHPUnit tests cover redirect sanitization plus error-text HTML escaping; Playwright coverage for [result.php](../../admin/result.php) (safe redirect, blocked external/javascript targets, escaped message, no meta refresh when `redir` is omitted).
- **HTML shell (modernisation):** Shared templates now use an **HTML5** document type (`<!DOCTYPE html>`), explicit **UTF-8** charset, and a **viewport** meta tag for basic mobile scaling — [include_header](../../templates/include_header.html), [admin_header](../../templates/admin/admin_header.html), [install](../../templates/install.html), [admin_slim_header](../../templates/admin/admin_slim_header.html), [rounds-chatlog](../../templates/rounds-chatlog.html), plus the parser HTML wrapper from `CreateHTMLHeader()` in [functions_parser-helpers.php](../../include/functions_parser-helpers.php).
- **Tests:** Playwright checks HTML5 doctype and charset meta on representative public routes.
- **Fatal / friendly error pages:** `DieWithErrorMsg` and `DieWithFriendlyErrorMsg` now output a minimal **HTML5** shell (`<!DOCTYPE html>`, charset, viewport) via `UltraStats_RenderStandaloneErrorDocumentHtml()` in [functions_common.php](../../include/functions_common.php); escaped detail text behavior is unchanged.
- **Legacy IE PNG workarounds removed:** [install](../../templates/install.html), [index](../../templates/index.html) medal tiles, and [medals](../../templates/medals.html) no longer use **AlphaImageLoader** filters or **`CheckAlphaPNGImage`** inline scripts; unused **`CheckAlphaPNGImage`** was removed from [common.js](../../js/common.js).
- **Tests:** PHPUnit covers the standalone error document helper.
- **Presentational / safety (Phase 3.3):** Parser user-check and FTP password failure title in [functions_parser-helpers.php](../../include/functions_parser-helpers.php) use **`us-error-text`** and **`htmlspecialchars`** for dynamic text. Admin [servers-ftpbuilder.php](../../admin/servers-ftpbuilder.php) FTP verify messages replace `<font color="red">` with **`us-error-text`** and escape **IP**, **port**, **path**, **username**, and **log filename** in error output.
- **Last played rounds layout:** On [players-detail](../../templates/players-detail.html), [info-maps](../../templates/info-maps.html), [info-gametypes](../../templates/info-gametypes.html), and [serverstats](../../templates/serverstats.html), the **date/time** and **Details** link are stacked in one column; **gametype** and **map** each have their own column where applicable. Shared **`us-lastrounds-*`** rules in [defaults.css](../../css/defaults.css) fix cramped/overlapping cells.
- **Team colour markup:** [index.html](../../templates/index.html) and [rounds.html](../../templates/rounds.html) use **`<span class="…">`** (existing `.WinnerTeam` / `.LoserTeam` / `.DrawTeam` theme rules) instead of **`<font>`** for flags and scores; invalid leftover **`</font>`** tags in the DM winner cell are removed; [rounds.html](../../templates/rounds.html) map thumbnail cell entity fixed (`&nbsp;`).
- **Player detail hit-area hovers:** [players-detail.php](../../players-detail.php) builds damage **`<span class="us-damage-pct">`** with validated **`#RRGGBB`** inline colours (helpers **`UltraStats_PlayerDetailCssHexColor`**, **`UltraStats_PlayerDetailHoverDamagePctHtml`**) instead of **`<font color>`**; **`us-damage-pct-zero`** in [defaults.css](../../css/defaults.css) for **0%**.
- **Documentation:** [docs/template-variable-trust.md](../../../docs/template-variable-trust.md) — **`{VAR}`** trust levels, **`<!-- INCLUDE -->`** / **`{ERROR_DETAILS}`** / **`{ERROR_MSG}`** (Phase 1.4 / 7.2).
- **JavaScript (Phase 5.2):** [include_header](../../../templates/include_header.html) (**server / language / style**) and [include_pager](../../../templates/include_pager.html) (**year / month** when time filter is on) use **`us-autosubmit-select`**; [common.js](../../../js/common.js) listens for **`change`** and calls **`form.submit()`** (no inline **`OnChange`** handlers).
- **Public header (accessibility):** [include_header](../../../templates/include_header.html) — each of the three top **`<select>`** controls has a stable **`id`** (**`us-header-serverid`**, **`us-header-langcode`**, **`us-header-stylename`**) and the adjacent bold caption uses **`<label for="…">`** so assistive tech can associate label and control (URLs and **`GET`** fields unchanged).
- **Install wizard step 2 (markup):** [install.html](../../../templates/install.html) permission indicator column uses **`us-install-perm-cell`** plus **`us-install-perm-ok`** / **`us-install-perm-fail`** from [defaults.css](../../../css/defaults.css) instead of **`bgcolor`** on the cell (**#007700** / **#770000** unchanged).
- **Public top menu (layout):** [include_menu.html](../../../templates/include_menu.html) uses **`us-top-menu`**; [defaults.css](../../../css/defaults.css) uses **`table-layout: auto`**, **`td.topmenu1` / `td.topmenu1begin`** with **`width: auto`**, **`white-space: nowrap`**, and **`min-width: max-content`** (public nav only — [admin_menu.html](../../../templates/admin/admin_menu.html) has no **`us-top-menu`**). This avoids both clipping from legacy narrow **`td width`** attributes and overlap when labels are long; a very wide row scrolls horizontally.
- **Weapon / damage-type lists (markup):** [weapons.html](../../templates/weapons.html) and [damagetypes.html](../../templates/damagetypes.html) list rows — close the **player-count** bar **`<td>`** after the inner bar table (was missing **`</td>`**; could confuse table column assignment next to the weapons **external info** cell).
- **Header / pager / admin selects:** [include_header](../../templates/include_header.html), [include_pager](../../templates/include_pager.html), [admin/index.html](../../templates/admin/index.html), [admin/stringeditor.html](../../templates/admin/stringeditor.html) — uppercase **`STYLE`** on **`<select>`** normalized to **`style`** (same widths).
- **Anchors (markup style):** public and admin **`.html`** templates; **`LN_INSTALL_ERRORINSTALLED`** in [lang/en/main.php](../../lang/en/main.php) / [lang/de/main.php](../../lang/de/main.php); parser confirmation markup in [functions_parser-helpers.php](../../include/functions_parser-helpers.php) — legacy **`<A HREF>` / `</A>`** normalized to **`<a href>` / `</a>`** (same URLs).
- **Bold / breaks (markup style):** templates — **`<B>` / `</B>`** → **`<b>` / `</b>`**; **`&lt;BR&gt;`** → **`&lt;br&gt;`** on [index.html](../../templates/index.html) and [admin/result.html](../../templates/admin/result.html). Installer strings in **main.php** (en/de): **`<b>config.php</b>`**, **configure.sh** / **contrib** emphasis tags lowercased.
- **Parser messages:** [functions_parser.php](../../include/functions_parser.php) — printed resume / time-limit lines use consistent lowercase **`<b>`** … **`</a>`** … **`</b>`**.
- **Italic / attributes:** several templates — **`&lt;I&gt;` / `&lt;/I&gt;`** → **`&lt;i&gt;` / `&lt;/i&gt;`** on pager rows; **`width="100%"class=`** → **`width="100%" class=`** where the space was missing before **`class`** (HTML5 attribute separation).
- **Event attributes:** templates — legacy **`OnMouseOver`** / **`OnMouseMove`** / **`OnMouseOut`** / **`OnClick`** → **`onmouseover`** / **`onmousemove`** / **`onmouseout`** / **`onclick`** (same handlers and behaviour).
- **Body / parser wrapper:** [include_header](../../templates/include_header.html), [admin_header](../../templates/admin/admin_header.html), [admin_slim_header](../../templates/admin/admin_slim_header.html), [install](../../templates/install.html), [rounds-chatlog](../../templates/rounds-chatlog.html) — **`topmargin`** / **`leftmargin`** / **`marginwidth`** / **`marginheight`** on **`<body>`**. [functions_parser-helpers.php](../../include/functions_parser-helpers.php) embedded parser HTML: **`<script>`**, **`onload`**, same body margin attributes (replacing uppercase **`SCRIPT`** / **`OnLoad`** / **`TOPMARGIN`**).
- **Stylesheet links:** **`type="text/css"`** dropped from **`<link rel="stylesheet">`** in shared headers, install, chatlog iframe, parser HTML head, and [functions_common.php](../../include/functions_common.php) standalone error document (default MIME type unchanged).
- **Script tags:** [include_header](../../templates/include_header.html), [admin_header](../../templates/admin/admin_header.html), [install](../../templates/install.html) — **`&lt;script src=&quot;…common.js&quot;&gt;`** without **`type="text/javascript"`**; [admin/index.html](../../templates/admin/index.html) inline scripts use **`<script>`** only.
- **FTP builder:** [servers-ftpbuilder.html](../../templates/admin/servers-ftpbuilder.html) — **`language="javascript"`** removed from **`<script>`** blocks (obsolete in HTML5).
- **DOM lookups:** [servers-ftpbuilder.html](../../templates/admin/servers-ftpbuilder.html) — **`document.all.preview`** → **`document.getElementById('preview')`**; [players-detail.html](../../templates/players-detail.html) (commented legacy axis markup) — **`document.all('playerlegend_killedby')`** → **`document.getElementById('playerlegend_killedby')`**.
- **Player / rounds layout:** [players-detail.html](../../templates/players-detail.html) — added the missing space between **`colspan="2"`** and **`class="line1"`** on the **total playtime** row (was **`colspan="2"class=…`**, invalid HTML5). [rounds.html](../../templates/rounds.html) had the same typo on the **round details** header cell. Browsers were mis-parsing the table so main stat cells appeared empty and the ratio row looked broken.
- **JavaScript (Phase 5.1 / 5.3):** [common.js](../../js/common.js) — legacy **MSIE/Opera** sniffing at load removed; **`movePopupWindow`** uses **`UltraStatsPointerPageY`** / **`UltraStatsPointerClientX`**; **`disableEventPropagation`** uses **`stopPropagation`**; guards when **`popupdetails`** is missing; **`window.UltraStatsUI`** mirrors globals.
- **Player detail hit-location hovers (markup):** [players-detail.php](../../players-detail.php) — damage and 0% hover fragments use **single-quoted** HTML attributes so the string is safe inside template hover data attributes. (Earlier **`class="…"`** double quotes cut the attribute short and showed raw handler text on the page.)
- **Player detail hit-zone layout:** [players-detail.html](../../templates/players-detail.html) — **`us-hitloc-*`** classes on the two half-width panels and inner chart/stats row; nested CoD4 sprite **`table`** (**`us-hitloc-figure`**) keeps **`border-spacing: 0`**, zero **`td`** padding, and **`img { display: block }`** so body-part tiles align; outer **`table.us-hitloc-inner`** uses **`table-layout: auto`** and the chart cell **`width: 220px`** (**`content-box`**) so the 220px-wide sprite grid is not squeezed. The stats sub-table (**`us-hitloc-stats-table`**) still uses **`table-layout: fixed`** + column classes (**`us-hitloc-col-*`**) so zone names and kill counts stay readable.

### Changes (maintainability / SQL)

- **CSS (Phase 4.1 / maintainability):** [defaults.css](../../css/defaults.css) — **`:root`** defines **`--us-color-error`**, **`--us-color-bar-*`**, and related tokens; **`.ErrorMsg`** and the **`us-*`** utility classes above consume **`var(...)`** so hex values live in one place (appearance unchanged by default).
- **CSS (Phase 4.1a / all shipped themes):** [themes/default/main.css](../../../themes/default/main.css) (**`--us-default-*`**), [themes/dark/main.css](../../../themes/dark/main.css) (**`--us-dark-*`**), [themes/codww/main.css](../../../themes/codww/main.css) (**`--us-codww-*`**) — top menu / flyout **`var()`** wiring (**`.topmenu1`**–**`.topmenu3`**, links); appearance unchanged.
- **Templates (Phase 3.5):** public **`ERROR_DETAILS`** / **`LN_ERROR_DETAILS`** banners are **inline HTML** under **`<!-- IF -->`** in [weapons.html](../../templates/weapons.html), [damagetypes.html](../../templates/damagetypes.html), [players-detail.html](../../templates/players-detail.html), [info-maps.html](../../templates/info-maps.html), [info-gametypes.html](../../templates/info-gametypes.html), [medals.html](../../templates/medals.html), [serverstats.html](../../templates/serverstats.html), [index.html](../../templates/index.html) (**`error_noserver`**), [players.html](../../templates/players.html) / [rounds.html](../../templates/rounds.html), [find-players.html](../../templates/find-players.html) / [find-chat.html](../../templates/find-chat.html), [rounds-detail.html](../../templates/rounds-detail.html). [include_header.html](../../templates/include_header.html) inlines **`error_installfilereminder`**; [admin_header.html](../../templates/admin/admin_header.html) inlines **`isupdateavailable`**; [servers.html](../../templates/admin/servers.html) / [servers-ftpbuilder.html](../../templates/admin/servers-ftpbuilder.html) inline **`ERROR_MSG`** / FTP-warning blocks. **`$content`** assignments from PHP unchanged.
- **German strings:** [lang/de/main.php](../../lang/de/main.php) — **`LN_GLOBAL_STATS`** uses the correct UTF-8 spelling **präsentiert** (fixes a corrupted replacement character in the shipped file).
- **Documentation (Phase 7.2):** [docs/template-variable-trust.md](../../../docs/template-variable-trust.md) — **`{ERROR_DETAILS}`** / **`{ERROR_MSG}`** trust guidance; **no** separate error-banner fragment files (markup inline per template).
- **CSS (Phase 4.2):** [defaults.css](../../css/defaults.css) holds shared **`TD`** font/size, **`img`** border reset, and legacy **`<font>`** styling; theme **`main.css`** files only set **`TD`** text colour. [rounds-chatlog.html](../../templates/rounds-chatlog.html) and **`UltraStats_RenderStandaloneErrorDocumentHtml()`** in [functions_common.php](../../include/functions_common.php) load **`defaults.css`** before theme CSS.
- **CSS (Phase 4.2b):** [defaults.css](../../css/defaults.css) — section **`.title`** / **`.titleSecond`** layout (font, height, alignment, horizontal tile repeat) and list-cell **`font-size`** for **`.line0`–`.line2`** / **`.tableBackground`**. Shipped themes retain palette, **`a.title`** rules, hovers, and **`images/bg_3.png`** / **`bg_4.png`**.
- **PHP (Phase 7.2a):** [functions_common.php](../../include/functions_common.php) — **`UltraStats_h()`** for HTML text/attribute escaping; used by [result.php](../../admin/result.php) (admin flash + redirect line), **`UltraStats_EscapeErrorTextForHtml`**, **`UltraStats_RenderStandaloneErrorDocumentHtml`**, and the PHP 7.4+ gate message. **Tests:** `RedirectSanitizeTest::testUltraStats_h_escapesForHtml`. [template-variable-trust.md](../../../docs/template-variable-trust.md) updated.
- **JavaScript (Phase 5.1):** [common.js](../../js/common.js) — section comments (pointer helpers, **`NewWindow`**, toggle display, popups, autosubmit **`<select>`**, **`UltraStatsUI`**); legacy **`NewWindow`** / **`HoverPopupMenuHelp`** / Phase 5.2 IIFE comment text cleaned to ASCII (same behaviour).
- **Tests:** Playwright asserts a visible **`td.title`** on **`/players.php`** and **`/rounds.php`** when the list is enabled; **`test.skip`** if the title row is missing (stats off or empty install).
- **Documentation:** [template-variable-trust.md](../../../docs/template-variable-trust.md) — **Key routes** (Phase 1.4): **weapons**, **damagetypes**, **serverstats**, **medals**, **about**; **Escaping cookbook** (Phase 7.2).
- **Tests:** Playwright asserts **`td.title`** on **`/weapons.php`**, **`/damagetypes.php`**, **`/serverstats.php`**, **`/medals.php`** when enabled (**`test.skip`** if missing); **`/about.php`** requires **`td.title`** unconditionally.
- **Obsolete `<center>`:** replaced by **`<div class="us-center">`** and **`.us-center`** in [defaults.css](../../css/defaults.css) across public/admin templates and matching PHP-printed fragments (parser / install hint).
- **Parser shell:** server list `SELECT` uses `DB_QueryBound` (no placeholders).
- **info-maps.php / info-gametypes.php:** map name and gametype name from `?id=` use bound parameters for detail and “last rounds” queries.

## Version 0.3.21, 2026-04-28

### Changes and bugfixes

- **Homepage medals:** fixed row rendering and spacing in homepage medal sections (pro/anti/custom) so cards are centered consistently and no longer forced into brittle 6-item wraps.
- **Homepage template:** corrected malformed HTML in [src/templates/index.html](../../templates/index.html) (stray closing tags/entities and link closure) that could destabilize table layout.
- **Theme CSS (codww):** replaced legacy `cursor:hand` usage and corrected an invalid font declaration in [src/themes/codww/main.css](../../themes/codww/main.css) for better browser compatibility without changing overall style.

## Version 0.3.20, 2026-04-27

### New features

- **CI:** GitHub Actions publishes a release tarball (`git archive`) on `v*` tag pushes; release body combines ChangeLog excerpts with generated notes (`.github/scripts/build_release_body.py`); [README.md](../../../README.md) and [AGENTS.md](../../../AGENTS.md) document Releases.
- **Admin parser:** Server-Sent Events live log (`parser-sse`, shared `parser-core-operations` with `parser-core`); cooperative cancel (`parser-cancel.php`, tmp flag); batched monospace log UI; structured FTP/password prompts; dark-themed embed with viewport-clamped log panel (`defaults.css`, `parser.html`).
- **Admin parser (embedded SSE completion):** on successful stream end, sticky green **DONE** banner with optional elapsed time and link back to the server list (`LN_PARSER_DONE`, `LN_PARSER_RETURN_SERVERLIST` en/de); not shown on cancel, chained run-totals, or FTP/password-confirmation flows.
- **Log parser:** large-parse performance (parse-scoped lookup caches, set-based `CreateTopAliases` per server and for global **Run total stats**, batched `mysqli_multi_query` for queued `UPDATE`s, `INSERT … ON DUPLICATE KEY UPDATE` for player/time stats).
- **Log parser:** `JT` (join team); advanced round-action lines `FT`, `FR`, `FC`, `RC`, `RD`, `BP`, `BD` (CTF / KOTH / bomb events); **CoD:WaW** compact `W` / `L` win/loss lines when `gen_gameversion` is WaW.
- **Medals (CoD / UO / CoD2):** pro medals for shotgun, MG, Thompson (display), and Panzerschreck (weapon kill rankings).
- **Documentation:** maintainer deployment ([docs/maintainer-deployment.md](../../../docs/maintainer-deployment.md)), CSP staging ([docs/csp-staging.md](../../../docs/csp-staging.md)), prepared-statement inventory ([docs/prepared-statements-surface.md](../../../docs/prepared-statements-surface.md)); Docker rebuild helpers and gamelog resolution notes in [AGENTS.md](../../../AGENTS.md).

### Changes and bugfixes

- **PHP 8 / MySQLi:** `DB_Query` and `DB_Exec` catch `mysqli_sql_exception` so failures return `false` instead of fatals; `DB_GetRowCount` hardened; `DB_GetRowCountBound` for filtered list counts.
- **Security / SQL:** `password_hash` / `password_verify` with MD5 fallback; bound parameters and safer patterns across admin lists (players, strings, servers), `GetPlayerHtmlNameFromID`, install paths, `FillPlayerWithAlias` / `FillPlayerWithTime`, `FindAndFillWithTime` (dynamic `IN`), `FindAndFillTopAliases`, `CreateBannedPlayerFilter` (int-cast GUIDs), rounds gametype filter + `LIMIT`, index/top-players thresholds, `GetAndSetGlobalInfo` and `GetAndSetMaxKillRation` integer casting; `UltraStats_SqlLikeContainsPattern` for `LIKE`; `WriteConfigValue` escapes name/value and handles empty `SELECT` results.
- **Install:** `UltraStats_ValidateTablePrefix` before prefixed DDL; `gen_gameversion` and `database_installedversion` via `DB_ExecBound` after schema batch; upgrade runner accepts single-statement `db_update_*.txt` files (statement count check uses `< 1`); web installer chooses **InnoDB** (default) or **MyISAM** for new tables (`TYPE=MyISAM` in schema rewritten to `ENGINE=…`); `config.sample.php` includes informational `DBStorageEngine`; `UltraStats_NormalizeStorageEngine` / `UltraStats_ApplyStorageEngineToSchemaSql` in `functions_db.php`.
- **Docker:** `seed-database.php` honors `ULTRASTATS_DB_STORAGE_ENGINE` (default **InnoDB**).
- **Parser / aliases:** correct empty result handling after `DB_GetAllRows()` (`!empty` vs `isset`) in parser, consolidation, and admin server lookup; `UltraStats_Utf8StringForDatabase` + utf8mb4-safe alias `INSERT`/`WHERE` (fixes MySQL 1366 on non-ASCII log names); avoid indexing missing `SERVER` rows in admin parser.
- **Database internal versions 8–14** (template + `db_update_*.txt`): v8 schema/config alignment with hardened mysqli paths; v9 widen `stats_aliases.AliasChecksum` to `INT` unsigned; v10 `stats_aliases` index; v11 indexes on `stats_player_kills` and `stats_rounds`; v12 **CoD:WaW** `stats_maps` `REPLACE` seeds (`db_update_v12.txt` + `db_template.txt`); v13 index `idx_aliases_playerid_alias` (`PLAYERID`, `Alias`) for global `CreateTopAliases`; v14 fill empty **EN** CoD/UO/CoD2 map blurbs in `stats_language_strings` (matches `db_template_codww2only.txt`; `UPDATE` only where `TEXT` is still `''`).
- **Docker:** `seed-database.php` CoD4-oriented import, latin1 SQL loads, sample servers and dev admin user; `UltraStats_ResolveGamelogLocation` for relative gamelog paths from app root; `server_total_ratio` consolidation when no players exist.
- **rounds-detail.php:** fixed PHP 8 fatal when a round has no round-action rows (empty `gameactions` still passed `isset()` but never populated `$content['gameactions']`).
- **rounds-detail.php:** initialize `$AllPlayers` and skip medal/awards when there are no players; harden `GetRoundPlayerDetails` when the kills query returns no mysqli result.
- **damagetypes.php:** default `mostskills_maxkills` / `killedby_maxkills` to `0` when grouped kill queries return no rows (fixes PHP 8 `array offset on null` warnings).
- **Schema seed:** remove duplicate `stats_maps` `INSERT` for `mp_subway` from `db_template_cod4only.txt` (row already in base template / WaW seeds) so install / `seed-database.php` does not fail with duplicate key `MAPNAME_UNIQUE`.

## Version 0.3.14, 2026-04-26

### New features

- Documented project for PHP 7.4+ / MySQL 8, Docker dev stack, and security in [README.md](../../README.md), [AGENTS.md](../../AGENTS.md), [SECURITY.md](../../SECURITY.md), and [`.agent/`](../../.agent/README.md) skills.
- Replaced `ext/mysql` with **mysqli**; **prepared statements** for high-risk web/admin SQL (`find-chat`, `find-players`, user admin, parser server lookup).

### Changes and bugfixes

- Hardened redirects and sessions; chat/player search and admin user flows use **bound parameters**; schema adjustments for **MySQL 8** (e.g. utf8mb4 index limits).
- Bundled static docs in **`src/doc/en/`** converted to **Markdown**; [Content-Security-Policy](../../SECURITY.md#content-security-policy) guidance added for operators.
- Assorted front-end and empty-result SQL fixes for PHP 8 / MySQL 8 (e.g. `IN ()` guards).

## Version 0.3.13 (beta), 2008-11-30

### New features

- Added icons for game versions to the top left on the menubar.
- Added `SQL_BIG_SELECTS` workaround for certain databases.
- Number of top players on the main page is configurable now.
- Added search page for searching in the chat logs.
- Added workaround for changed `ACTION` logging format of Pam4 in CoD4. However, Pam4 still breaks the log format in a way that some features (e.g. chat logging) will not work with PAM4.

### Changes and bugfixes

- Fixed PHP4 compatibility issues in the log parser.
- Fixed donate button.
- Added database upgrade V7, including important changes in the database. Also adds missing weapons, maps, and other content automatically, including on existing installations.
- Fixed SD gametype default for CoD:WW; empty gametypes are displayed with gametype id on the main page now.
- Fixed "WTF OMFG" error when player time was 0 seconds (e.g. client disconnected immediately).
- Fixed strange increment error in `install.php`.

## Version 0.3.12 (beta), 2008-11-18

### New features

- Added new general frotnend options, to inject html code at certain
    places, prepend a string in the title tag and customize the
    UltraStats Logo url.
- Added help text for FTP Create button.
- Added display of the current configured game.
- Added check if gamelogfile is actually writeable.
- Added quick and dirty support for download gamelogfiles over http.
    Just a fully qualified http url instead of ftp, the stats parser
    automatically detect.
### Changes and bugfixes

- Fixed Sniper Medal for Codww
- Removed some minor issues with missing templates variables.
- Fixed serious security issue of reading the serverid parameter.
- Fixed problem with session initialization on Microsoft IIS Webservers.
- Fixed a problem in the default db templates, causing some mysql 4
    version to fail durign installation.
- Added support to display new weapon ids proberly and correct.
- Fixed minor notice bug when reading script timeout from db settings.
- Fixed PB Guid detection string
- Fixed Knife medal for CodWW and fixed minor bug in the medals
    page template.
- Fix detection of command line mode, which also fixes php
    session management.
- Added fix for "SQL_BIG_SELECT" errors in logparser.

## Version 0.3.11 (beta), 2008-10-05

### Changes and bugfixes

- Fixed race condition, when a new logfile is used the LastLogLine
    was only reseted internal. We are reseting the playedseconds as well now.
- Fixed typing issues and removed notices issues
- Changed display name of Marine Soldier to American Soldier
- Removed TM from frontpage logo
- Fixed RoundEnd Detection in Parser, which caused following errors.

## Version 0.3.10 (beta), 2008-10-04

### New features

- Added missing .357 Magnum Pistol including images and description.
### Changes and bugfixes

- Calculation of time (roundbegin) has been hardened and corrected against
    large logfiles which contain server restarts. Added two new fields
    into Server Table needed for this and future enhancments.
- Removed some obselete weapons from template database
- All fopen calls changed to use @fopen, this avoids php warnings

## Version 0.3.9 (beta), 2008-10-03

### Changes and bugfixes

- Replaced all weapon images with new rendered weapn images from the
    final game. Added lots of missing images as well.
- Fixed all references to Call of Duty: World ar War.
- Fixed minor spelling issues in default database template
- Removed old obselete documentation.
- Session Startup is done in every site now!

## Version 0.3.8 (beta), 2008-10-01

### New features

- Added few missing language strings for certain existing and new weapons.
- Added README document
- Added images for certain existing and new weapons
### Changes and bugfixes

- Lots of fixes in the weapon table, replaced some of the existing
    weapon images with better ones.
- Added new attachment images
- Removed ANTI Medals from code for now.
- Fixed minor installer issues and enhanced critical error messages.
- Changed few minor things in the docs and about page

## Version 0.3.7 (devel), 2008-09-30

### New features

- Added some german translation
- Added warning if FTP Extensions are disabled!
- Enhanced database query performance in player admin
- Show found player number in player admin
- Prepared time filter for consolidation table
### Changes and bugfixes

- Fixed GUID issues bug in player admin causing failed edits of some players
- Fixed minor issues if new gametypes were added, no displayname was used
- Fixed lots of minor display issues and minor template issues
- Cleaned up gametypes in default database template
- Removed useless default charset from tabel defs

## Version 0.3.6 (devel), 2008-09-29

### New features

- Added missing map picture for airfield
### Changes and bugfixes

- Fixed minor sql issues in medal statements
- Fixed sort order of available stats years and months
- fixed misspelled svt40 images
- Set default bar images for players without kills
- Added result workaround for TDM gametype in Cod:WW
- Added missing weapons into default sql statement set
- Changed artillery text
- Unknown alias is now displayed with -Topalias Unknown-

## Version 0.3.5 (devel), 2008-09-28

### New features

- Added new default theme called "codww" which is like the current
    www.callofduty.com style.
- Implemented Update Check feature which is performed when the user logs
    into the admin center. If an update is available, the user will be
    reminded on each admin page.
- Added option to set php script execution timeout, if possible.
    This will help people who have to parse the logfile
    using the webserver.
- Links within text description are parsed and modified, so that always
    open in a new window.
- Implemented time filter into medal code. All sql statements had
    to be modified for this to work.
### Changes and bugfixes

- Fixed some sql statement issues
- Added additional pager template, forgot to add in last version
- Fixed typo of table name when deleting a player in admin/players.php

## Version 0.3.4 (devel), 2008-09-24

### New features

- Implemented Time Filtering which can be selected now on the left
    side below the menu. The time filtering can go down to year and month
    level. Available years and month will automatically be generated by
    the statsdata.
- Also cleaned up the template coding, replaced the default error display,
    and added more useful error description in certain places.
- Added submenu option into pager include. Added available gametypes
    menu into round list.
- Damagetype and Weapon lists are now stored in helper tables, the data
    is consolidated in the Total/Final Calculations but can also be done
    seperated in the Serverlist Menu. This improves performance for
    stats display on larger databases.
- Also added some more popup help texts in certain areas.
- Fixed a few minor isses in the css and templates.

## Version 0.3.3 (devel), 2008-09-21

### New features

- Added 4 new Player Models for Cod:WW, and rewrote the hitdetection
    model view in the player details. Details are now shown in a popup
    when you hover the body parts. It is also possible to configure
    which model you want to use in the player details:
    marine, german, japanese and russian.
- Added german translation
- Added support to enable GZIP compression. This can be used to reduce
    outgoing html traffic.
### Changes and bugfixes

- LogParser: Added workaround to add players into a running round which did not join before. This workaround is only applied in the KILL log line for now.
- Fixed few minor display and visiblity issues in the stats
- Changed some debug levels in the parser. Default debug level is
    restricted to more useful output now.
- Fixed readability issue in dark style
- Added menu workaround for Internet Explorer, so it works there as well.
- Fixed default picture in serverlist view
- LogParser: Rewrote round begin and round end detection to
    work with new Cod:WW Gametypes.
- LogParser: Fixed a bug in the custom time start detection method
    using the gamestartup variable workaround.
- LogParser: Fixed a roundstart time calculation bug which caused
    played rounds to appear in the future.

## Version 0.3.2 (devel), 2008-09-18

### New features

- Initial Changelog entry for the third UltraStats release
- Added support for Cod:WW (Call of Duty: World at War)
- Added map images for Cod:WW
- Added weapon images for Cod:WW
- Added string editor in Admin Center
- Implemented new css based menu into UltraStats
- Enhanced and cleaned up the basic "default" and "dark"
- Added support to LIST weapons and damagetypes on ONE site
- Added favicon.ico
### Changes and bugfixes

- Added new Installations instructions document called "INSTALL"
- Added GPLv3 document "COPYING"
- Removed unused files, fixed pager in stringeditor and minor
    other visual tweaks
- Removed unsupported languages and themes for now.
    Going to add them back in a later step
- Enhanced AdminMenu, fixed a few style sheet bugs
- Fixed minor issue with includes and server deletion
- ini_set commands won't create an error now
- Removed Windows linefeeds from include files
- Enhanced the UltraStats installer, better error handling now!
- Fixed issue of showing PBGUid Field when no PBGuid was available
- Fixed wrong sized thmbnails for custom maps
- Fixed bug in INSERT statement of server admin
- Fixed a bug of players which were not displayed on the detail page.
    Only happened if there GUID was empty.
- Fixed leaking DB handle in GetSingleDBEntryOnly
- Removed useless files like multiple Thumbs.db occurences
- Removed old cvs crap (using git now ;) )!
