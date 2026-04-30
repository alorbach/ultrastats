# Frontend and admin modernization plan

Multilevel, compatibility-first roadmap for UltraStats **public templates**, **admin UI**, **CSS**, and **JavaScript**. **Refactoring** (markup, escaping, structure) is separate from **visual redesign** (typography, spacing, new frameworks).

**Hard constraints:** Do not break existing **URLs**, **query parameters**, **form field names**, **admin workflows**, **parser/SSE shapes**, or **database semantics**. Prefer **small, reviewable PRs**.

**References:** [AGENTS.md](../AGENTS.md), [SECURITY.md](../SECURITY.md), [docs/ui-compatibility-review.md](ui-compatibility-review.md).

**Recently implemented (shipping label v0.3.23):** Modernization plan closure for Phases **1–7** in the current compatibility scope. Phase **4** closes with shared shell/layout tokens, shipped-theme `cellmenu*` tokens, parser/SSE/FTP panel CSS tokens, and audited dead-rule removals limited to proven legacy IE/obsolete rules. Phase **5** closes with active inline handlers removed, current `common.js` sections/exports documented, parser classic + embedded EventSource/admin-index/FTP builder logic externalized, IE branches dropped, and mocked-`EventSource` coverage for the embedded parser confirmation panel. Phase **6** closes with POST+CSRF deletes where compatible, nonce-backed parser destructive GET confirmations, key admin form labels/hints, escaped admin `{ERROR_MSG}` paths, alert/live-region error strips, and real fallback back links. Phase **7** closes with final static audits, trust/CSP/governance docs, and changelog coverage. Explicit future/non-goals: framework reskin, route-specific visual redesign, in-app CSP header enforcement, and deleting selectors that cannot be proven unused by grep plus route coverage.

**Document map:** Short summaries appear in **Level 0–5** sections below. **Detailed sub-plans** for each level start at [Detailed sub-plans](#detailed-sub-plans-by-level).

---

## Implementation status (rolling)

| Phase | Items | Status |
|-------|--------|--------|
| **1** Baseline | 1.1 Playwright depth | **Done** — public/admin core smoke now includes shared shell assertions (`us-chrome-*` and admin menu chrome) and route-level contract checks on key routes (`find-*` form contracts, header selectors, admin index shell tables), while preserving `test.skip` only for truly data-dependent surfaces. |
| | 1.2 `result.php` tests | **Done** — safe redirect, escaped `msg`, blocked off-origin/`javascript:` (see smoke spec). |
| | 1.3 HTML validate | **Done** — mandatory `html-validate` Playwright suite (`e2e/tests/html-validation.spec.ts`) now checks representative public/admin pages in standard E2E runs. |
| | 1.4 `{VAR}` trust inventory | **Done** — **[`template-variable-trust.md`](template-variable-trust.md)** now includes a closure matrix covering Phase-1 core public/admin routes plus trust-level and escaping ownership guidance. |
| | 1.5 Screenshot baselines | **Done** — **[`e2e/tests/admin-visual-baseline.spec.ts`](../e2e/tests/admin-visual-baseline.spec.ts)** and **[`e2e/tests/full-route-visual.spec.ts`](../e2e/tests/full-route-visual.spec.ts)** run strict `toHaveScreenshot` assertions by default (no env gate), with committed snapshots and byte-size guards retained. |
| **2** Security | 2.1–2.4 | **Done** — `UltraStats_SanitizeRedirectTarget`, back links, `HoverPopup` `textContent`, `DieWith*` escaping. |
| **3** HTML | 3.1–3.2 doctype/charset/viewport | **Done** |
| | 3.3 presentational (`font`/`bgcolor` → CSS) | **Done** — remaining legacy presentational surfaces replaced: parser body inline color style moved to `.us-parser-body`; player color rendering no longer emits `<font>` (uses `<span>`), template inline style attributes removed in active templates and replaced with shared utility classes in `defaults.css`; prior 3.3 items remain (parser debug grid class, install permission classes, body margin attrs removal, semantic tag normalization, etc.). |
| | 3.4 IE PNG / AlphaImageLoader | **Done** |
| | 3.5 Error/update banners (**no spare fragment files**) | **Done** — public **`ERROR_DETAILS`** / **`LN_ERROR_DETAILS`** boxes are **inline HTML** under **`iserror`**, **`error_noserver`**, empty **`players` / `rounds`**, **`find-*`**, **`rounds-detail`** (**[`players.php`](../src/players.php)** / **[`rounds.php`](../src/rounds.php)** still set **`ERROR_DETAILS`**). **[`include_header.html`](../src/templates/include_header.html)** inlines **`error_installfilereminder`**. **[`admin_header.html`](../src/templates/admin/admin_header.html)** inlines **`isupdateavailable`**. **[`servers.html`](../src/templates/admin/servers.html)** / **[`servers-ftpbuilder.html`](../src/templates/admin/servers-ftpbuilder.html)** inline **`ERROR_MSG`** / FTP-warning markup. **[`rounds-chatlog.html`](../src/templates/rounds-chatlog.html)** unchanged (**`{ERROR_DETAILS}`** in iframe). |
| **4** CSS | 4.1–4.2 variables / dedupe | **Done** — shared rules and color constants are tokenized in `defaults.css` and all shipped themes (`default`, `dark`, `codww`) for the current modernization scope, including title/list rows, public menu/flyouts, `cellmenu*`, parser/SSE confirm and FTP-password panels, debug/status colors, and shell chrome tokens. Larger visual redesign or framework adoption is out of scope. |
| | 4.3 inner flex/grid | **Done** — parser embed toolbar/status/cancel and related visibility handling now use reusable inner-layout classes (`.us-parser-embed-toolbar`, `.us-parser-stream-status`, `.us-parser-cancel-btn`, `.us-hidden`); admin/public inner utility classes (`.us-form-select-*`, `.us-fixed-w-*`, `.us-max-w-600`, `.us-pad-*`, etc.) replace inline layout styling without touching outer chrome. Narrow-header follow-up stacks logo/control cells and constrains public top-menu, admin-menu, public pager, dense admin list/table, representative public content-table, and player/round detail shell overflow on mobile widths. |
| | 4.4 outer table chrome | **Done** — aggressive rollout applied through shared public/admin shell templates (`include_header`/`include_footer`, `admin_header`/`admin_footer`) using `us-chrome-*` classes and theme-tuned shell tokens (`--us-chrome-*`), with smoke + visual baseline checks for shell presence on representative routes. Narrow-view follow-up adds a <=1100px shell-body overflow strategy (`.us-chrome-body` as block + horizontal overflow container) so dense legacy content scrolls inside the body chrome instead of forcing page-level horizontal overflow. |
| **5** JS | 5.1 structure `common.js` | **Done** — file header and section boundaries now match the active compatibility surface (pointer / **`NewWindow`** / popup helpers / delegated template handlers / parser classic shell / admin parser embed / admin index medals / FTP builder / **`UltraStatsUI`**). Legacy globals remain exported through `window` and mirrored under **`window.UltraStatsUI`** for compatibility. A deeper module split is a future refactor, not unfinished modernization work. |
| | 5.2 inline handlers → listeners | **Done** — active templates no longer carry inline **`onclick`** / **`onkeyup`** / mouse-hover attributes. **`include_header.html`** + **`include_pager.html`** use **`us-autosubmit-select`**; shared public **`include_menu.html`** uses delegated **`.us-toggle-display`**, **`.us-popup-help`**, and **`data-enhance-timeout*`** handlers; **`players-detail.html`** hit-location image/legend hovers use delegated **`.us-player-popup-part`** / **`.us-player-legend-part`** handlers and no page-local body-map script; public **`weapons.html`** / **`damagetypes.html`** stat bars and admin **`servers.html`** icon/action tooltips use **`.us-popup-help`**; shared public/admin **`#popupdetails`** tables use **`.us-popup-panel`**. **`servers-ftpbuilder.html`** “Close Window” uses **`us-admin-ftpbuilder-close`**, FTP preview fields use delegated **`input`** with **`textContent`**, and **`servers.html`** FTP builder launch uses delegated **`.us-open-popup`**. |
| | 5.3 IE branches | **Done** — **`common.js`** no longer carries active IE-specific branches: load-time MSIE/Opera sniffing is gone, `window.event` / `cancelBubble` fallbacks were removed, string-based `setTimeout` was replaced with a callback, and the old `HoverPopupMenuHelp` Trident-only floating menu tooltip is now a no-op compatibility shim. Modern menu usability uses CSS flyouts/native titles; future work should prioritize responsive layout and CSS design. |
| | 5.4 Admin SSE / new JS pattern | **Done** — canonical parser UI uses **`EventSource`** from shared **[`common.js`](../src/js/common.js)** bound to **[`parser.html`](../src/templates/admin/parser.html)** data attributes; server contract in **[`parser-sse.php`](../src/admin/parser-sse.php)** / **[`parser-core-operations.php`](../src/admin/parser-core-operations.php)** is unchanged; mocked-`EventSource` smoke covers the visible confirm panel and nonce-backed resume URL without executing destructive actions. Operator/proxy notes remain in **[AGENTS.md](../AGENTS.md)** § Embedded parser (SSE). |
| **6** Admin UX | 6.1–6.4 | **Done** — inventory + **users** / **players** / **stringeditor** delete confirms (**POST + CSRF**); parser **nonces** with classic, raw SSE payload, and mocked embedded-confirm UI coverage; **`ErrorMsg` + `role="alert"`** on key admin error strips; **servers/users/stringeditor** forms have labels/IDs and HTML5 hints that mirror existing validation; server save validation now checks relative game-log paths against the UltraStats app root like the parser does and reports validation errors instead of PHP 8 **`fclose(false)`** fatals; **servers/parser/login/upgrade/FTP builder** validation messages are escaped before template output where applicable; optional browser **`confirm()`** prompts remain only as first-step guards; admin confirm/error back links use real fallback URLs plus delegated **`.us-history-back`**. Further copy or visual redesign is future UX work. |
| **7** Governance | 7.1 dead CSS/JS | **Done** — legacy **`cursor:hand`** → **`cursor:pointer`**; obsolete IE **`scrollbar-*`** dropped; active IE branches, `document.all`, `window.event`, `cancelBubble`, `javascript:history.back`, `<font>`, `bgcolor`, `<center>`, inline active scripts, and active inline event handlers are covered by final greps. CSS selector deletion is limited to proven-unused rules; ambiguous legacy selectors are retained and audited. |
| | 7.2 frontend conventions doc | **Done** — **`UltraStats_h($content['ERROR_MSG'])`** is documented and applied on the key touched admin paths (`players`, `users`, `stringeditor`, `servers`, `parser`, `login`, `upgrade`, `servers-ftpbuilder`) before template output when those paths expose `{ERROR_MSG}`. CSP/trust guidance is updated for the externalized JS and remaining operator-staged policy. |
| | 7.3 changelog discipline | **Done** for shipped UI/security fixes on this line |

**Program tracks (short):** **A** Safety — redirect/reflection/popups/errors + **pilot CSRF** on admin user delete and **parser confirmation nonces** on high-risk parser GETs; further admin POST coverage remains incremental. **B** Markup — HTML5 shell + ongoing presentational cleanup. **F** Docs — changelogs maintained per repo rules.

---

## Level 0 — North star

- **Outcome:** HTML5-ready shell, safer output, maintainable CSS/JS, clearer admin UX, without changing routes or data contracts.
- **Principles:** Keep **server-rendered PHP** and the existing `{VAR}` template engine; **escape at data boundaries**; **parity before pixels**; do not preserve IE-only behavior when it conflicts with modern usability, CSP, or responsive CSS work.

---

## Level 1 — Program tracks

| Track | Purpose |
|--------|--------|
| **A. Safety & contracts** | Escaping, redirects, CSRF, regression tests |
| **B. Markup & semantics** | DOCTYPE, validity, structure, accessibility baseline |
| **C. CSS** | Variables, layout evolution, responsiveness |
| **D. JavaScript** | Vanilla cleanup, CSP-friendly patterns |
| **E. Admin UX** | Confirmations, validation, consistent feedback |
| **F. Documentation & release** | Conventions, changelog, operator notes |

**Dependency:** Track **A** gates risky **B/C/D** work on user-controlled strings; **E** often needs **A** (e.g. POST + tokens).

---

## Level 2 — Phases

### Phase 1 — Baseline and safety net

**Goal:** Define “correct” and catch regressions early.

| ID | Task |
|----|------|
| 1.1 | Extend Playwright (`e2e/tests/frontend-admin-smoke.spec.ts`): DOM assertions or snapshots on critical public + admin paths (many checks are data-dependent and may `test.skip`). |
| 1.2 | Add tests for `admin/result.php` redirect and message parameters (safe vs malicious inputs) once hardened. |
| 1.3 | Optional: HTML validation (e.g. html-validate) in CI for a **small** set of pages (install, login, index). |
| 1.4 | Inventory **`$content` / `{VAR}` → trust level** (plain text vs intentional HTML). |
| 1.5 | Screenshot baseline: default theme + one alternate theme. |

**Running smoke tests locally:** From `e2e/`, set `PLAYWRIGHT_BASE_URL` to the app base URL (e.g. Docker dev `http://127.0.0.1:8091`), then `npx playwright test tests/frontend-admin-smoke.spec.ts`.

**Themes already covered in tree (non-exhaustive):** Public — find players/chat, about, info-gametypes, rounds detail, chatlog iframe, weapons, maps/medals, damagetypes, serverstats, players list/detail, index, install error alert semantics, shared `include_header`. Admin — login, upgrade, parser (toolbar, log, SSE), string editor, index config, players/users/servers lists and edits, error patterns where applicable.

---

### Phase 2 — Security and correctness hotfixes

**Goal:** Close obvious issues without UI redesign.

| ID | Task |
|----|------|
| 2.1 | `admin/result.php`: sanitize meta-refresh target (`UltraStats_SanitizeRedirectTarget`); HTML-escape reflected message and related output. |
| 2.2 | Fix broken back link in `admin/players.html` (`javascript:history.back()`). |
| 2.3 | **`HoverPopup` / `innerHTML`:** classify DB/user-derived args; use `textContent` or a single safe HTML helper. |
| 2.4 | Error pages (`DieWithErrorMsg` / friendly variant): no raw user input in HTML without escaping. |

---

### Phase 3 — Low-risk HTML cleanup (refactor only)

**Goal:** Valid, modern document shell; minimal visual change.

| ID | Task |
|----|------|
| 3.1 | HTML5 doctype + `<meta charset="utf-8">` where UTF-8 is already the response charset (avoid double-encoding). |
| 3.2 | Viewport meta + minimal CSS checks (`width=device-width, initial-scale=1`). |
| 3.3 | Replace presentational markup with classes (`font`/`bgcolor` → CSS) while preserving appearance. |
| 3.4 | Remove IE PNG/Alpha and related hacks after Phase 1 baselines pass. |
| 3.5 | Repeating banners: **inline** markup per template **`<!-- IF -->`** (or **`$content` from PHP**) — **avoid** multiplying tiny **`include_*.html` fragment files** for errors/warnings. |

---

### Phase 4 — CSS modernization

**Goal:** Maintainable styling; optional responsiveness.

| ID | Task |
|----|------|
| 4.1 | **`:root` CSS variables** per theme (colors, spacing, fonts). |
| 4.2 | Deduplicate shared rules between `src/css/defaults.css` and `src/themes/*/main.css`. |
| 4.3 | Introduce flex/grid **inside** existing table chrome first; narrow blast radius. |
| 4.4 | Replace outer table chrome only if visual parity is proven (snapshots). |
| 4.5 | **Defer** Bootstrap/Tailwind unless opening a dedicated admin reskin program. |

**Lowest-risk default:** plain modern CSS + variables; avoid heavy frameworks until escaping and layout baseline are stable.

---

### Phase 5 — JavaScript modernization

**Goal:** Same behavior; path toward CSP without `unsafe-inline` long term.

| ID | Task |
|----|------|
| 5.1 | Structure `src/js/common.js` (sections / IIFE / small module boundary). |
| 5.2 | Replace simple inline handlers with `addEventListener` + `data-*` — **page by page** (start with `include_header.html` forms). |
| 5.3 | **Done:** remove IE-specific branches; keep only harmless API shims where external code might still call old global names. |
| 5.4 | Use **`admin/parser.html`** **`EventSource`** style as the pattern for new admin JS; do not fork SSE event names or payload shapes without versioning — see **[AGENTS.md](../AGENTS.md)** § Embedded parser (SSE) and **Phase 5 expanded — 5.4a** below. |

**Note:** jQuery is not in tree; stay **vanilla** unless requirements change.

---

### Phase 6 — Admin UX and workflow hardening

**Goal:** Safer operations and clearer feedback; **behavior-compatible**.

| ID | Task |
|----|------|
| 6.1 | Destructive actions: confirmations; move toward **POST + CSRF** where feasible without breaking bookmarked flows. **Done for current scope:** users/players/stringeditor use POST+CSRF where compatible; parser destructive browser/SSE flows keep nonce-backed GET because EventSource uses GET; classic screens, raw SSE payloads, and mocked embedded confirm UI are covered without executing destructive actions. |
| 6.2 | Standardize success/error/info markup and classes. |
| 6.3 | Client hints + server validation messages on key forms. **Done for current scope:** server, user, and string editor add/edit/filter fields have stable labels/IDs and HTML5 hints matching server validation without changing names or POST semantics; server, parser, login, upgrade, FTP builder, users, players, and string editor message paths escape `{ERROR_MSG}` before template output where applicable. |
| 6.4 | Align admin navigation, titles, and back links. |

---

### Phase 7 — Final cleanup and governance

| ID | Task |
|----|------|
| 7.1 | Remove dead CSS/JS (confirm with grep + tests). |
| 7.2 | Document frontend conventions (escaping helpers; when `{VAR}` may contain HTML). |
| 7.3 | User-visible changes: root [ChangeLog](../ChangeLog) and [src/doc/en/changelog.md](../src/doc/en/changelog.md) per repo rules. |

---

## Level 3 — Suggested wave schedule (adjust to cadence)

| Wave | Focus | Typical PR count |
|------|--------|------------------|
| W1 | Phase 1 + 2.1–2.2 | 1–3 |
| W2 | Phase 2.3–2.4 + 3.1–3.2 | 2–4 |
| W3 | Phase 3 remainder + 4.1 | 2–3 |
| W4 | Phase 4.2–4.3 | 2–4 |
| W5 | Phase 5.1–5.2 (header + one admin screen) | 2–3 |
| W6 | Phase 6.1 (highest-risk admin actions first) | 2–5 |

---

## Level 4 — Decision checklist

| Question | Prefer |
|----------|--------|
| Visible layout change? | Separate PR; before/after screenshot or Playwright tolerance. |
| Data in `{VAR}`? | Escape unless whitelisted as HTML snippet from trusted source. |
| New CSS framework? | Only under explicit reskin initiative. |
| Parser / install touched? | Run install E2E and parser smoke paths. |

---

## Level 5 — Definition of done (by PR type)

- **Security / escaping:** Tests for malicious input; no open redirect; no new unescaped sinks into DOM or meta refresh.
- **Markup:** No change to form `name`, `action`, or `method` without an explicit compatibility checklist.
- **CSS:** Theme screenshots or automated visual checks unchanged unless intentionally redesigned.
- **JS:** Server select, language, style, menus, parser stream still pass smoke tests.

---

## Detailed sub-plans by level

The sections below expand **Level 0** through **Level 5** into actionable sub-plans: objectives, scoped tasks, primary touchpoints, verification, and sequencing notes.

---

### Level 0 — Detailed sub-plan (North star)

| Area | Detail |
|------|--------|
| **Primary objective** | Ship incremental UI improvements that operators can adopt without retraining on URLs, forms, or parser flows. |
| **Success signals** | Fewer XSS/open-redirect classes of bugs; CI catches template regressions; CSS/JS easier to change without duplicate theme edits. |
| **Non-goals** | Rewriting stats in a SPA; breaking bookmarked admin GET links without a migration note; changing `stats_*` schema for UI-only work. |
| **Guardrails** | Every PR answers: (1) Which routes/forms/SSE did we preserve? (2) What did we escape? (3) What did we test? |
| **Ordering** | Establish baselines (Phase 1) before large markup/CSS deletes; fix redirect/reflection (Phase 2) before preaching CSP. |
| **Metrics (lightweight)** | Playwright green on `frontend-admin-smoke`; optional install-e2e when install/templates change; manual spot-check on second theme. |

---

### Level 1 — Detailed sub-plans (Program tracks)

#### Track A — Safety & contracts

| Step | Action | Notes / paths |
|------|--------|----------------|
| A.1 | **Redirect & reflection** | `src/admin/result.php`, `src/templates/admin/result.html`; align with `UltraStats_SanitizeRedirectTarget()` in `functions_common.php`. |
| A.2 | **Escaping inventory** | For each `{VAR}` fed from DB, GET, or logs: mark **text** vs **HTML**; document in Phase 1.4 artifact (sheet or `docs/` appendix). |
| A.3 | **DOM sinks** | `src/js/common.js` (`HoverPopup`, etc.); `src/templates/players-detail.html` and any template passing rich hover text. Prefer `textContent` or trusted-builder for HTML fragments only. |
| A.4 | **Error surfaces** | `DieWithErrorMsg` / `DieWithFriendlyErrorMsg` in `functions_common.php` — ensure `$szerrmsg` is never raw user input. |
| A.5 | **CSRF (later)** | Phase 6: session-backed token for state-changing POSTs; document exceptions for legacy GET actions during transition. |
| A.6 | **Tests** | Extend `e2e/tests/frontend-admin-smoke.spec.ts`; add focused specs for `result.php` after fixes. |

**Exit criteria:** No known open redirect on result page; reflected `msg` safe; inventory doc started; critical popups classified for trust level.

---

#### Track B — Markup & semantics

| Step | Action | Notes / paths |
|------|--------|----------------|
| B.1 | **DOCTYPE / head** | `src/templates/include_header.html`, `admin/admin_header.html`, `install.html`, `admin_slim_header.html` — migrate to HTML5 doctype + charset meta in small PRs. |
| B.2 | **Landmarks** | Optionally add `<main>`, improve heading order without changing visual tables-first structure initially. |
| B.3 | **Presentational cleanup** | Replace `<font>`, redundant `bgcolor` with classes; map colors into theme CSS. |
| B.4 | **Accessibility** | Associate labels with server/lang/style selects in header forms; preserve `role="alert"` where already added. |
| B.5 | **Validation** | Optional CI: fetch rendered HTML for 2–3 routes and run validator (account for template placeholders in fixture mode if needed). |

**Exit criteria:** Validator warnings reduced; no regression in form submission; screen reader labels improved on highest-traffic forms.

---

#### Track C — CSS

| Step | Action | Notes / paths |
|------|--------|----------------|
| C.1 | **Variables** | Each `src/themes/*/main.css`: define `:root { --us-* }` for background, text, borders, title bar; replace literals incrementally. |
| C.2 | **Shared vs theme** | Move identical rules to `src/css/defaults.css`; keep theme files for deltas only. |
| C.3 | **Layout** | Inner wrappers: flex for parser toolbar areas, header toolbars — **after** screenshots exist. |
| C.4 | **Responsive** | **Mostly done for shared/list/detail shells:** narrow shared header now stacks the 400px logo and selector controls; public top menu, admin menu, public pager rows, dense admin list tables, representative public content/list tables, and player/round detail shells are contained in horizontal scroll strips so page width remains stable. Admin summary/config/filter panels and public search/error panels fit the mobile body chrome. Further work: route-specific detail layout redesign only when usability, not containment, requires it. |
| C.5 | **Dead rules** | Shipped themes: IE **`scrollbar-*`** on **`BODY`** removed; **`cursor:hand`** → **`pointer`** (see Phase **7.1**). Final static audit is complete; remove future selectors only when grep plus route coverage proves they are dead. |

**Exit criteria:** Themes still load; no 404 for `images/` paths in CSS; visual parity on baseline screenshots unless PR is explicitly redesign.

---

#### Track D — JavaScript

| Step | Action | Notes / paths |
|------|--------|----------------|
| D.1 | **Structure** | Comment blocks or single IIFE exporting to a minimal `window.UltraStatsUI` namespace to avoid global collisions. |
| D.2 | **Header forms** | Replace `OnChange="document.serveridform.submit()"` with JS file listener; keep form `name` attributes. |
| D.3 | **Popup stack** | Refactor `HoverPopup` to separate **title** / **body** handling; sanitize or text-only body for untrusted data. |
| D.4 | **IE removal** | **Done:** active MSIE/Trident branches removed from `common.js`; remaining follow-up should target responsive usability and CSS design, not old browser parity. |
| D.5 | **Parser / SSE** | Reference implementation: **[`src/templates/admin/parser.html`](../src/templates/admin/parser.html)** (`EventSource`, log DOM); server: **[`src/admin/parser-sse.php`](../src/admin/parser-sse.php)**; shared ops **[`src/admin/parser-core-operations.php`](../src/admin/parser-core-operations.php)**. Do not duplicate or rename stream **`event:`** types without a migration plan — see **[AGENTS.md](../AGENTS.md)** § Embedded parser (SSE). |

**Exit criteria:** Smoke tests pass; no new console errors on Chromium/Firefox for exercised pages; inline handler count trending down.

---

#### Track E — Admin UX

| Step | Action | Notes / paths |
|------|--------|----------------|
| E.1 | **Risk ordering** | List destructive `op=` / links (`parser.php`, `servers.php`, etc.); prioritize confirmations + POST migration. |
| E.2 | **Patterns** | Reuse one “confirm + POST” pattern (hidden fields, same handler) to limit one-off PHP sprawl. |
| E.3 | **Messaging** | Unify `.ErrorMsg`, success banners, `result.php` messages via shared template partials if helpful. |
| E.4 | **Validation** | Server-side remains source of truth; add HTML5 `required` / `pattern` only where it mirrors server rules. |

**Exit criteria:** Highest-risk actions no longer single-click; CSRF story documented even if not 100% migrated.

---

#### Track F — Documentation & release

| Step | Action | Notes / paths |
|------|--------|----------------|
| F.1 | **Developer doc** | Short “how to add a template variable safely” in this file or `SECURITY.md` cross-link. |
| F.2 | **Changelog** | Any user-visible UI/security fix: [ChangeLog](../ChangeLog) + [src/doc/en/changelog.md](../src/doc/en/changelog.md). |
| F.3 | **CSP** | When removing inline handlers, update [SECURITY.md](../SECURITY.md) staged CSP notes with what remains. |

**Exit criteria:** New contributors can find escaping + test expectations in one hop from AGENTS or this doc.

---

### Level 2 — Detailed sub-plans (Phases 1–7)

#### Phase 1 — Baseline (expanded)

| Sub-ID | Task | Verification |
|--------|------|--------------|
| 1.1a | List top 15 URLs from smoke spec; ensure each has assertion beyond HTTP 5xx checks. **`find-players` / `find-chat`** default load asserts **`td.title`**. | CI green. |
| 1.1b | Add stable selectors (`data-testid` optional) only if necessary — prefer roles/classes already present. | Review for minimal DOM churn. |
| 1.2a | Tests: `redir=https://evil` → must not navigate off-origin; `redir=index.php` → OK. | Playwright. |
| 1.2b | Tests: `msg=<script>…` → must not execute (escaped or stripped). | Playwright + manual DOM inspect. |
| 1.3a | Add `package.json` script + CI job optional; fail soft or warn-only initially. | Team agreement. |
| 1.4a | Spreadsheet columns: Variable, Source (PHP file), Trust (text/html), Escaping status. | Living document. |
| 1.5a | Capture: index, players list, admin servers, parser running state (if available). | Attached to repo wiki or CI artifact. |

---

#### Phase 2 — Security hotfixes (expanded)

| Sub-ID | Task | Verification |
|--------|------|--------------|
| 2.1a | Apply sanitizer to **both** meta refresh URL and any displayed redirect text. | Unit/integration via E2E. |
| 2.1b | Ensure `CONTENT` attribute cannot break out via quotes (encoding). | Malicious query cases. |
| 2.2a | Fix `admin/players.html` back link; grep for `history.back;` typos elsewhere. | `rg "history\.back"` |
| 2.3a | Trace hover strings from PHP for `players-detail`, `damagetypes`, admin icon tooltips. | Code path read + test with crafted DB row in dev. |
| 2.3b | If HTML hover is required, whitelist tags or generate from structured data server-side. | Security review. |
| 2.4a | Audit callers of `DieWithErrorMsg` for user-controlled fragments. | Grep + fix. |

---

#### Phase 3 — HTML cleanup (expanded)

| Sub-ID | Task | Verification |
|--------|------|--------------|
| 3.1a | Replace doctype in **all** entry headers used by public/admin/install/slim flows. | Grep `DOCTYPE`. |
| 3.1b | After charset meta, confirm DB/lang still render (no mojibake). | Visual on DE/EN. |
| 3.2a | Viewport: check admin tables don’t become unusable; add horizontal scroll container if needed. | Narrow viewport manual. |
| 3.3a | Map each `<font>` to a class in theme CSS. | Diff screenshots. |
| 3.4a | Remove `CheckAlphaPNGImage` calls + IE filter styles; verify PNGs in modern browsers. | index/medals/install. |
| 3.5a | Maintain banner parity **without** new fragment files (inline **or** PHP-built **`$content`**). | **Done** — Phase-3.5 **`include_*` error/update strips removed; callers carry the same **`{VAR}`** contract documented in **`template-variable-trust.md`**. |

---

#### Phase 4 — CSS (expanded)

| Sub-ID | Task | Verification |
|--------|------|--------------|
| 4.1b | **`defaults.css`** **`:root`** defines **`--us-color-error`**, **`--us-color-bar-{positive,negative,neutral}`**, etc.; **`.ErrorMsg`**, **`us-error-text`**, **`us-stat-bar-*`**, **`us-install-perm-*`**, **`us-credit-nick`**, **`us-damage-pct-zero`** use **`var()`** (same hex as before). | Any theme can override tokens on **`:root`** without editing each rule. |
| 4.1a | **`themes/default/main.css`** **`--us-default-*`**; **`themes/dark/main.css`** **`--us-dark-*`**; **`themes/codww/main.css`** **`--us-codww-*`** — top-menu / flyout rules use **`var()`**. | Visual parity; spot-check nav + dropdown hover per theme. |
| 4.2a | Identify duplicate `TD`, `.title`, `.line0` rules; consolidate once per theme. | **Done:** **`TD` / `img` / `font`** + **4.2b** layout in **`defaults.css`**; **`themes/{default,dark,codww}/main.css`** carry palette for **`.title`**, **`.titleSecond`**, **`.line0`–`.line2`**, **`.tableBackground`**, and **`cellmenu*`** via theme-scoped **`--us-*`** **`var()`** on **`:root`** with the same rendered colours as before. |
| 4.3a | Parser embed and dynamic parser panels: SSE log/confirm panel and FTP-password panel colours moved to **`:root`** **`--us-parser-*`** tokens; rules use **`var()`** / shared classes (visual parity). | Parser smoke, mocked confirm panel smoke, and FTP builder smoke. |
| 4.4a | Outer header table: only touch after Phase 1 screenshots + flex prototype branch. | Branch strategy. |

---

#### Phase 5 — JavaScript (expanded)

| Sub-ID | Task | Verification |
|--------|------|--------------|
| 5.1a | **Classic parser shell JS:** **`functions_parser-helpers.php`** loads **`common.js`** and uses **`data-parser-autoscroll`**; classic parser resume/run-totals prompts in **`functions_parser.php`** / **`parser-core-operations.php`** use **`data-reload-url`** + **`data-reload-delay`** instead of inline **`setTimeout`** scripts. | Smoke asserts direct **`parser-core.php`** shell has shared **`common.js`**, body autoscroll marker, and no inline script block. |
| 5.1b | **FTP builder popup shell JS:** **`servers-ftpbuilder.html`** no longer embeds inline scripts for saved auto-close or popup centering/focus; **`common.js`** consumes **`data-ftpbuilder-close-delay`** and **`data-popup-center-*`** markers. | FTP builder smoke asserts no inline script block, popup-centering marker exists, preview still updates, and field names remain unchanged. |
| 5.2a | Implement delegation on `document` for `change` on known selects vs per-element IDs. | Header forms still submit same GET params. |
| 5.2b | Keep `document.serveridform` names if external docs reference them; or document rename as breaking. | Compatibility note. |
| 5.2c | **`include_pager.html`** `yearidform` / `monthidform` `<select>`: **`us-autosubmit-select`** (same delegate as header). | Time filter GET params unchanged (`userchange.php` `changeyear` / `changemonth`). |
| 5.2d | **`servers-ftpbuilder.html`** FTP preview inputs: inline **`onkeyup`** removed; **`common.js`** delegates **`input`** events for the existing **`ftpcheck`** form and writes preview with **`textContent`**. | FTP builder smoke verifies preview update, field names unchanged, and no inline **`onkeyup`** on preview fields. |
| 5.2e | **`include_menu.html`** public top-menu toggle/timeout/popup handlers: inline **`onclick`** / **`onmousemove`** / **`onmouseover`** / **`onmouseout`** removed in favour of delegated **`common.js`** handlers and **`data-*`** attributes. | Smoke asserts no inline JS handlers in **`table.us-top-menu`** and verifies the search submenu toggles open/closed. |
| 5.2f | **`players-detail.html`** hit-location map and killed-by legend hovers: repeated inline **`HoverPopup`** / **`HoverPlayerImage`** / **`OutPlayerImage`** handlers and the page-local script removed in favour of delegated **`common.js`** handlers backed by **`data-*`** attributes. | Smoke asserts no inline mouse handlers inside **`.us-hitloc-panel`** and verifies a hit-location hover still opens **`#popupdetails`**. |
| 5.2g | **`weapons.html`** / **`damagetypes.html`** stat-bar popups and shared public/admin **`#popupdetails`** hover-retain handlers moved to delegated **`.us-popup-help`** / **`.us-popup-panel`** behavior. | Smoke asserts no inline handlers on both public routes and verifies stat-bar hover still opens **`#popupdetails`**. |
| 5.2h | **`admin/servers.html`** icon/action/FTP-builder tooltips moved to delegated **`.us-popup-help`** while preserving URLs, form names, and destructive-action confirm classes. | Admin smoke asserts **`servers.php`** has no inline event handlers and verifies tooltip hover still opens **`#popupdetails`**. |
| 5.4a | **Admin SSE reference:** **`src/templates/admin/parser.html`** — **`EventSource`** URL (`parser-sse.php` / `op` query), **`data:`** line handling, **`confirm_action`**, **`need_resume`** / **`runtotals_next`** / **`done`** events, cancel UX. **`src/admin/parser-sse.php`** — **`text/event-stream`**; **`parser-core.php`** iframe path unchanged for HTML-form prompts. **Rules:** new admin streams reuse the same separation (shared PHP ops module + thin transport); proxy **`X-Accel-Buffering`** / no deflate — **[AGENTS.md](../AGENTS.md)**. | Parser smoke + cancel; SSE confirmation payload smoke asserts nonce-backed `confirmUrl`; mocked embedded parser UI smoke asserts the visible panel and **Yes** starts a new `EventSource` with the provided nonce URL. No renamed events without migration note. |
| 5.4b | **Admin parser embed CSP:** **`parser.html`** no longer embeds the EventSource UI as an inline script; **`common.js`** binds the existing **`#parser-log-wrap`** data contract and preserves cancel, **`need_resume`**, **`runtotals_next`**, **`done`**, confirm, and FTP-password panels. | Parser smoke asserts **`parser.php?op=runtotals`** has no inline script block and still exposes toolbar/log live-region semantics. |
| 5.4c | **Admin index medal CSP:** **`admin/index.html`** no longer embeds medal group-toggle or autosave/recalculate scripts; **`common.js`** binds existing **`.us-medal-group-toggle`** / **`.us-medal-cb`** controls and reads localized status text / recalc URL from **`#medal-autorecalc-status`** data attributes. | Admin index smoke asserts no inline script block, the recalc URL data contract remains, and existing label/checkbox contracts are unchanged. |

---

#### Phase 6 — Admin UX (expanded)

| Sub-ID | Task | Verification |
|--------|------|--------------|
| 6.1a | Inventory: delete server, delete stats, reset log line, user delete, string delete. | Table in issue. |
| 6.1b | For each: `confirm()` minimum; ideal POST + CSRF + PRG pattern. | E2E where automatable. |
| 6.2a | Define BEM-like or existing class naming for alerts; avoid shadowing Bootstrap if added later. | Style guide one-pager. |
| 6.4a | Admin back links: **`admin_securecheck.html`**, **`players.html`**, **`stringeditor.html`**, **`upgrade.html`**, and parser confirm output in **`functions_parser-helpers.php`** use real fallback URLs plus delegated **`.us-history-back`** in **`common.js`** instead of **`javascript:history.back()`** links. | Smoke asserts fallback hrefs, labels, and redo icon accessibility on confirm views. |

---

#### Phase 7 — Cleanup (expanded)

| Sub-ID | Task | Verification |
|--------|------|--------------|
| 7.1a | `rg` for unused classes after refactors; remove only with coverage. | **Done for current scope:** final greps cover legacy inline handlers, IE DOM patterns, `javascript:history.back`, `<font>`, `bgcolor`, `<center>`, active inline scripts, `cursor:hand`, and obsolete scrollbar CSS. Ambiguous selectors are retained unless grep plus route coverage proves they are dead. |
| 7.2a | Add **`UltraStats_h()`** in **`functions_common.php`** (`htmlspecialchars` wrapper). | **Done** — **`admin/result.php`**, **`UltraStats_EscapeErrorTextForHtml`**, **`UltraStats_RenderStandaloneErrorDocumentHtml`**, PHP version check, and key admin `{ERROR_MSG}` paths (`players`, `users`, `stringeditor`, `servers`, `parser`, `login`, `upgrade`, `servers-ftpbuilder`); PHPUnit **`RedirectSanitizeTest`**. |

---

### Level 3 — Detailed sub-plans (Waves)

#### Wave W1

| Deliverable | Detail |
|-------------|--------|
| PR-1 | Phase 1.1a–1.1b: stronger smoke assertions on 3–5 critical routes. |
| PR-2 | Phase 2.1 + 2.2: `result.php` hardening + `players.html` back link; add Phase 1.2 tests if landing together. |
| Optional | Phase 1.5 screenshot artifact job (manual OK). |

**Gate:** E2E green on default Docker dev stack.

---

#### Wave W2

| Deliverable | Detail |
|-------------|--------|
| PR-1 | Phase 2.3: `HoverPopup` / hover data classification + fix for untrusted paths. |
| PR-2 | Phase 2.4: error page audit. |
| PR-3 | Phase 3.1–3.2: doctype + charset + viewport on main templates. |

**Gate:** No new failures on install wizard smoke if install header changed.

---

#### Wave W3

| Deliverable | Detail |
|-------------|--------|
| PR-1 | Phase 3.3–3.5: presentational cleanup + **3.5** policy (inline / PHP **`$content`**, no banner fragment files). |
| PR-2 | Phase 4.1: **`defaults.css`** **`:root`** utility tokens (**done**); **`themes/{default,dark,codww}/main.css`** top-menu tokens (**4.1a** done). |

**Gate:** Alternate themes still parse; spot-check dark theme.

---

#### Wave W4

| Deliverable | Detail |
|-------------|--------|
| PR-1 | Phase 4.2: dedupe defaults vs theme. |
| PR-2 | Phase 4.3: inner flex/grid for one high-value screen (e.g. parser or header toolbar). |

**Gate:** Screenshot or Playwright compare for touched pages.

---

#### Wave W5

| Deliverable | Detail |
|-------------|--------|
| PR-1 | Phase 5.1: `common.js` structure. |
| PR-2 | Phase 5.2: header + pager `<select>` handlers migrated off inline `OnChange` (`us-autosubmit-select`). |
| Doc | Phase **5.4a**: SSE / admin JS reference captured in this plan + **Track D** points at **`parser.html`** / **AGENTS**. |

**Gate:** Full smoke including server/language/style switches and time-filter year/month when enabled; parser route loads (`admin/parser.php`).

---

#### Wave W6

| Deliverable | Detail |
|-------------|--------|
| PR-1 | Phase 6.1 for top 2 destructive actions (design which first). |
| PR-2 | Phase 6.2 messaging partials/classes. |

**Gate:** Manual confirmation flow documented for any action not yet in E2E.

---

### Level 4 — Detailed sub-plan (Decision checklist)

| Scenario | Steps | Outcome |
|----------|--------|---------|
| **S1 — New template variable** | (1) Add in PHP to `$content`. (2) Add `{VAR}` in HTML. (3) Classify trust. (4) Escape if text. (5) Add smoke assertion if user-visible critical path. | Merged only with escaping row in inventory. |
| **S2 — CSS looks wrong on one theme** | (1) Identify which theme file diverged. (2) Fix variable or override in that theme only. (3) Re-run dual-theme screenshot. | No change to PHP contracts. |
| **S3 — Need new dependency** | (1) Default **no**. (2) If CDN framework: rejected without vendor bundle policy. (3) If npm build: needs CI story. | Prefer zero new build step until reskin program. |
| **S4 — Parser/SSE touched** | (1) Read AGENTS SSE section. (2) Run admin parser smoke. (3) Test cancel button. (4) Test timeout resume if applicable. | No event name/shape change without dual versioning. |
| **S5 — Install wizard touched** | Run `docker compose -f docker/docker-compose.install-e2e.yml` flow or CI equivalent. | Install steps 1–7 still pass. |

---

### Level 5 — Detailed sub-plan (Definition of done)

| PR type | Must have | Should have | Nice to have |
|---------|-----------|-------------|--------------|
| **Security / escaping** | Tests for malicious input; code review on all new outputs | Inventory row updated | Security.md bullet if operator-visible |
| **Markup** | Checklist: forms unchanged | HTML validator delta noted | a11y improvement called out |
| **CSS** | Before/after for affected pages or “no visual change” claim | Variable used instead of magic color | Responsive note in PR |
| **JS** | Smoke + console clean on touched pages | Fewer inline handlers | CSP note updated |
| **Admin UX** | Confirmation or POST+token for destructive change | E2E for happy path | Unified message component |

**Review gate:** At least one maintainer confirms **compatibility** row (URLs/forms) explicitly in PR description.

---

## Risk summary

- **Phase 4.4 (outer table chrome):** treat as **blocked** until **Phase 1.5** visual baselines exist (or Playwright snapshot comparators are agreed)—wide layout changes without baselines are likely to ship subtle regressions across themes.
- Prefer small diffs; do not change URLs, query keys, form fields, or SSE event shapes unless intentional and documented.
- Template engine does **not** auto-escape: escaping is a **PHP responsibility** at assignment time.
- CSP tightening depends on reducing inline scripts and legacy handlers; see [SECURITY.md](../SECURITY.md#content-security-policy).

---

## Quick reference — high-value vs high-risk

**High-value:** Systematic escaping for template data; fix `result.php`; remove unsafe `innerHTML` for untrusted text; CSS variables; inline-handler removal for CSP; admin destructive-action hardening.

**High-risk:** Changing `{VAR}` names or PHP `content` keys; form contracts; parser SSE/cancel; install wizard; double-escaping after introducing `htmlspecialchars`; GET-based admin actions during CSRF work.

**Suggested first security PR title:** `fix(admin): sanitize result.php redirect meta and escape flash message`
