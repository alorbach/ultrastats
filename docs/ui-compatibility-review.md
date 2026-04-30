# UI compatibility review

**Scope:** current compatibility notes for the modernized legacy front end. This file now tracks the direction of travel: modern browser usability and responsive CSS over IE-era parity.

**CSP note:** UltraStats does not enable **Content-Security-Policy** by default; operational guidance and a staged rollout outline are in [SECURITY.md](../SECURITY.md#content-security-policy).

## Document type and doctype

- **HTML5** (`<!DOCTYPE html>`) on shared shells such as `src/templates/include_header.html`, with explicit `<meta charset="utf-8">` and a basic viewport meta for mobile scaling; legacy **table-based** layout remains.
- Very old `BODY` attributes like `TOPMARGIN`, `MARGINWIDTH` are deprecated; visual impact is usually minor in current Chromium/Firefox/Safari.

## Layout and CSS

- **Table layouts** and fixed table widths remain on many route bodies. Shared header, public/admin menu, public pager, dense admin list-table, representative public content/list-table, and player/round detail-shell overflow is contained on narrow viewports; deeper detail-page redesign remains route-specific.
- **Themes** use `src/themes/{user_theme}/main.css` plus `src/css/defaults.css`, `menu.css`. Assumes **desktop** pixel widths.
- **Print / zoom:** User font scaling can break fixed table columns; not tested in this pass.

## JavaScript

- **Vanilla** `src/js/common.js` for menus and small helpers. Active IE-specific branches have been removed; keep new code on modern DOM APIs and verify in current Chromium/Firefox/Safari-style browsers.
- **Inline handlers/scripts:** active templates have been migrated to delegated/external JavaScript in `src/js/common.js`; keep new UI work on the same CSP-friendly path.

## External assets and mixed content

- Footers and update fallbacks use **`https://alorbach.github.io/ultrastats/`** (no mixed-content issue with local HTTPS).

## Accessibility

- Form-driven navigation (server, language) may lack full **label/fieldset** structure in some templates. No automated axe pass was run in this pass.
- Contrast and focus rings depend on theme CSS; not validated against WCAG in this pass.

## Recommended follow-ups (when changing UI)

1. Continue replacing dense table layout with scoped grid/flex wrappers where it improves usability.
2. Harden **common.js** with modern, CSP-friendly code; add **CSP** incrementally and test.
3. Expand responsive rules for mobile and narrow desktop use.
4. Re-test **admin** and **parser** flows after any global CSS change.

## Out of scope (confirmed)

- No edits to `src/templates/`, `src/css/`, or `src/js/` for this review document.
