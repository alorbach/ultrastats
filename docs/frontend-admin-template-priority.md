# Frontend/Admin Template Modernization Priority

Prioritization is based on regression risk, user impact, and coupling to legacy scripts.

## Tier 1: High caution (modernize last, in tiny steps)

- `src/templates/players-detail.html`
  - High coupling to inline events, dense table layout, and generated stat bars.
- `src/templates/admin/parser.html`
  - Embedded SSE parser controls; operationally critical.
- `src/templates/admin/servers-ftpbuilder.html`
  - Popup flow and legacy JS assumptions.
- `src/templates/include_header.html`
  - Shared shell + global CSS/JS loading and doctype impacts all pages.

## Tier 2: Medium risk (modernize after baseline tests)

- `src/templates/rounds-detail.html`
  - Includes iframe chatlog embed and linked detail actions.
- `src/templates/weapons.html`
  - Inline handler usage and generated stat bars.
- `src/templates/admin/index.html`
  - Central config form and dynamic medal controls.
- `src/templates/admin/players.html`
  - Destructive actions and confirmation flows.

## Tier 3: Low risk (good first cleanup targets)

- `src/templates/about.html`
  - Static content, low behavior coupling.
- `src/templates/find-players.html`
- `src/templates/find-chat.html`
- `src/templates/info-gametypes.html`

## Suggested order for cleanup PRs

1. Tier 3 markup and deprecated attribute cleanup.
2. Shared non-behavioral CSS class extraction in common includes.
3. Tier 2 pages one-at-a-time with snapshot/smoke checks.
4. Tier 1 pages with dedicated targeted regression suites.

## Required guardrails for any template PR

- No route/query/form field renames.
- No token placeholder contract changes without synchronized PHP updates.
- Preserve parser event and admin action semantics.
- Include before/after screenshots for touched pages in PR description.

