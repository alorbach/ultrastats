# UI compatibility review (no code changes in this pass)

**Scope:** static review of the legacy front end as of modernization. **No** HTML/CSS/JS was modified; this is a record for a future UI refresh.

**CSP note:** UltraStats does not enable **Content-Security-Policy** by default; operational guidance and a staged rollout outline are in [SECURITY.md](../SECURITY.md#content-security-policy).

## Document type and doctype

- **HTML 4.01** (`<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">` in e.g. `src/templates/include_header.html`) with table-based layout.
- Browsers will use **standards** or **almost standards** mode depending on doctype; very old `BODY` attributes like `TOPMARGIN`, `MARGINWIDTH` are deprecated; visual impact is usually minor in current Chromium/Firefox/Safari.

## Layout and CSS

- **Table layouts** and fixed table widths; risk of **horizontal scroll** on narrow viewports. No responsive breakpoints.
- **Themes** use `src/themes/{user_theme}/main.css` plus `src/css/defaults.css`, `menu.css`. Assumes **desktop** pixel widths.
- **Print / zoom:** User font scaling can break fixed table columns; not tested in this pass.

## JavaScript

- **Vanilla** `src/js/common.js` for menus and small helpers (legacy **DOM** patterns, IE-era branches). The repository no longer ships unused third-party script bundles. Monitor the browser console for strict-mode or CSP issues if you tighten headers later.
- **Inline handlers** (e.g. `OnChange="document.serveridform.submit();"`) remain valid in HTML4 but are discouraged for CSP if you add `script-src` restrictions later.

## External assets and mixed content

- Footers and update fallbacks use **`https://alorbach.github.io/ultrastats/`** (no mixed-content issue with local HTTPS).

## Accessibility

- Form-driven navigation (server, language) may lack full **label/fieldset** structure in some templates. No automated axe pass was run in this pass.
- Contrast and focus rings depend on theme CSS; not validated against WCAG in this pass.

## Recommended follow-ups (when changing UI)

1. Adopt a single **doctype** (HTML5) and one grid/flex layout strategy.
2. Harden or replace **common.js** (legacy patterns) with modern, CSP-friendly code if needed; add **CSP** incrementally and test.
3. Add **viewport** meta and responsive rules if mobile matters.
4. Re-test **admin** and **parser** flows after any global CSS change.

## Out of scope (confirmed)

- No edits to `src/templates/`, `src/css/`, or `src/js/` for this review document.
