# Template variables — trust levels

UltraStats uses `{VAR}` placeholders filled from `$content` in PHP. **The template engine does not escape** — escaping is the responsibility of the PHP side before assignment.

This note satisfies **Phase 1.4 / Phase 7.2** of [frontend-admin-modernization-progress.md](frontend-admin-modernization-progress.md). Extend it as you audit routes.

## Levels

| Level | Meaning | Typical handling |
|-------|---------|------------------|
| **text** | Plain user or DB string shown as characters | `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')` at assignment, or a shared helper |
| **trusted_html** | Small intentional markup from trusted sources (e.g. admin-edited strings flagged as HTML) | Assign only through a documented path; avoid passing raw DB text here |
| **url / redirect** | Targets for `Location`, meta refresh, `href` | `UltraStats_SanitizeRedirectTarget()` (see [SECURITY.md](../SECURITY.md)) |
| **js_string** | Strings embedded in HTML `onclick` / attribute JS | Must not contain unescaped quotes; prefer `data-*` + external JS |

## Project helpers (non-exhaustive)

- **HTML text / attributes:** `UltraStats_h( $value )` — shorthand for `htmlspecialchars( (string) $value, ENT_QUOTES, 'UTF-8' )` — `functions_common.php` (**Phase 7.2a**)
- **Redirects:** `UltraStats_SanitizeRedirectTarget()` — `functions_common.php`
- **Error body text:** `UltraStats_EscapeErrorTextForHtml()` — fatal/friendly error pages (uses **`UltraStats_h`** internally)
- **Admin flash:** `result.php` escapes `msg` and redirect display (**`UltraStats_h`**)
- **Admin validation/errors:** key admin `{ERROR_MSG}` paths escape once in PHP before template output (`players`, `users`, `stringeditor`, `servers`, `parser`, `login`, `upgrade`, `servers-ftpbuilder`). Templates then render the escaped text in the established alert/live-region strips.

## Escaping cookbook (Phase 7.2)

Use at the **assignment** into `$content[...]` (or immediately before output if the value is one-off). The template engine does not add protection.

| Situation | Pattern |
|-----------|---------|
| User or DB string in normal HTML text / table cell | **`UltraStats_h( $s )`** in PHP (same as `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`). |
| Integer / ID for display | Cast to `int` or use a formatting helper; do not pass through `htmlspecialchars` as the only check for **SQL** — use bound parameters in queries. |
| String in a **double-quoted** HTML attribute you build in PHP | Escape for HTML; for `href` / `src` also validate scheme/host rules if the value is not fully trusted. |
| Redirect / meta refresh / `Location` | `UltraStats_SanitizeRedirectTarget()` (see [SECURITY.md](../SECURITY.md)). |
| Line breaks in error detail | `UltraStats_EscapeErrorTextForHtml()` preserves newlines as safe HTML structure. |
| Intentional **trusted_html** snippet | One documented code path only; never assign raw DB text without a deliberate “allowed tags” policy. |

**Double-escaping:** If you escape at assignment and the template or another layer escapes again, output will show entities — assign **either** raw + escape in template (not available here) **or** escaped once at the boundary; do not mix.

## Hover popups

`HoverPopup()` in `src/js/common.js` sets popup body via **`textContent`** (`setPopupTextById`). Strings that include `<br>` or markup are shown **literally** unless the popup path is changed to a safe HTML mode. Hit-location strings in `players-detail.php` remain HTML-oriented for a possible future safe renderer.

## `<!-- INCLUDE -->` scope

**Structural includes only** (`include_header.html`, `include_footer.html`, `include_menu.html`, `include_pager.html`, `include_index_globals.html`, admin menus/headers/slim wrappers): same **`{VAR}`** rules as full pages — **nothing** is escaped at include time.

**Policy:** Avoid adding new tiny **`include_*.html` files** for repeating error banners or reminders. Duplicate the small HTML block **in the route template** under **`<!-- IF ... -->`** and fill **`ERROR_DETAILS`** / **`ERROR_MSG`** / **`LN_*`** from PHP — or assemble HTML in **`$content`** when one path needs a different shape.

### Repeated banner **`{VAR}`** (trust)

| Variable | Typical trust | Where it appears |
|----------|---------------|------------------|
| `{ERROR_DETAILS}` | **text** or **trusted_html** | Inline public error strips (e.g. **`index`**, **`players`**, **`rounds`**, **`weapons`** …) + **`rounds-chatlog`** iframe body; **`GetAndReplaceLangStr`** paths — escape or whitelist HTML as today. |
| `{ERROR_MSG}` | **text** | **`servers.html`**, **`servers-ftpbuilder.html`** admin error strip; **`GetAndReplaceLangStr`** / controlled literals. |
| `{LN_ERROR_INSTALLFILEREMINDER}` | **text** | **`include_header.html`** block when **`error_installfilereminder`**. |
| `{LN_ERROR_DETAILS}` | **text** | Heading line in error boxes; from **`lang/*.php`**. |
| `{UPDATE_AVAILABLETEXT}` | **trusted_html** | **`admin_header.html`** update strip; from **`GetAndReplaceLangStr(LN_UPDATE_AVAILABLETEXT, …)`**; English string may include **`<br>`** (see **`lang/*/main.php`**). |
| `{LN_UPDATE_AVAILABLE}` | **text** | Same **`admin_header`** strip. |
| `{LN_UPDATE_LINK}` | **text** | Anchor text for handbook link. |
| `{isupdateavailable_updatelink}` | **url** | **`$_SESSION['UPDATELINK']`** — **`href`** only; operator-trusted. |
| `{LN_WARN_NOFTPEXTENSIONS}`, `{LN_WARN_DETAILS}` | **text** | **`servers*.html`** FTP-disabled warning strip. |

Treat each template block like a mini page: document which **`$content`** keys it expects and trust level.

## Key routes (starter inventory, Phase 1.4)

Extend this table when you work on a script or template. **Trust** is for data that reaches HTML; language keys (`LN_*`) are **text** once resolved from `lang/*` files.

| Area | Entry | Template(s) | Notes |
|------|--------|-------------|--------|
| Public | `index.php` | `index.html`, `include_header`, `include_menu` | Medals, server pickers, many `LN_*`; **`error_installfilereminder`** strip is **inline in `include_header`**. Inline hovers use `HoverPopup` / `textContent` for passed strings. |
| Public | `players.php` | `players.html` | List rows: player name / bar images; title row includes sort label; see PHP for `AliasAsHtml` vs plain. |
| Public | `rounds.php` | `rounds.html` | Round list; title `{titlesortedby}` from PHP. |
| Public | `weapons.php` | `weapons.html` | List + detail; category / weapon names from DB — see PHP for HTML vs plain. |
| Public | `damagetypes.php` | `damagetypes.html` | List + detail; same trust pattern as weapons. |
| Public | `players-detail.php` | `players-detail.html` | Highest `{VAR}` surface; damage hover fragments intentionally constrained (validated hex; quote-safe attrs). |
| Public | `find-players.php`, `find-chat.php` | matching templates | **`ERROR_DETAILS`** in **inline** error strip when no results / short query. |
| Public | `rounds-detail.php` | `rounds-detail.html` | **`ERROR_DETAILS`** + **inline** strip when round not loaded; **`LN_ROUNDS_ROUNDNOTFOUND`**. |
| Public | `rounds-chatlog.php` | `rounds-chatlog.html` | Standalone shell; **`ERROR_DETAILS`** when **`iserror`** (invalid id); same round-not-found string as detail. |
| Public | `serverstats.php` | `serverstats.html` | Server list / per-server stats; **`{ServerName}`** etc. from DB — treat as **text** unless a column is explicitly HTML. |
| Public | `medals.php` | `medals.html` | **`iserror`** + **inline** error strip on failure paths. |
| Public | `info-gametypes.php` | `info-gametypes.html` | **`id`** selects gametype **`NAME`** (bound query); display names / descriptions from DB + lang strings — **text**; **`ERROR_DETAILS`** on unknown id. |
| Public | `info-maps.php` | `info-maps.html` | Same pattern as gametypes for map **`MAPNAME`**; **`ERROR_DETAILS`** on invalid map. |
| Install | `install.php` | `install.html` | Wizard steps in one template; **`$CFG`** diagnostics and SQL errors reflected per step — escape at assignment where user paths appear; mostly **`LN_*`**. |
| Public | `about.php` | `about.html` | Mostly static copy + **`{BUILDNUMBER}`** (controlled version string). |
| Utility | `userchange.php` | *(no HTML template)* | Updates session (theme/lang/year/month/server) then **`UltraStats_SanitizeRedirectTarget`** + **`Location`**; no **`{VAR}`** HTML surface. |
| Admin | `admin/result.php` | `result.html` | **text** for `msg` / redirect (sanitized + escaped in PHP). |
| Admin | `admin/login.php` | `login.html` | Form fields; **`ERROR_MSG`** failure text is **text** and escaped with **`UltraStats_h`** before template output. |
| Admin | `admin/index.php` | `admin/index.html` | Config summary; language strings + controlled flags; treat DB-backed labels as **text**. |
| Admin | `admin/upgrade.php` | `admin/upgrade.html` | DB version / migration copy from PHP + **`LN_*`**; **`ERROR_MSG`** is **text** and escaped with **`UltraStats_h`** before output. Destructive actions still GET where the legacy upgrade flow requires it. |
| Admin | `admin/servers.php` | `servers.html`, `servers-ftpbuilder.html` | Server names and paths from DB — **text**; **`ERROR_MSG`** / FTP warning strips are **inline** in templates; validation and FTP-builder error text is escaped with **`UltraStats_h`** before template output and rendered through alert/live-region markup. |
| Admin | `admin/players.php` | `admin/players.html` | List/edit bans; **`{Alias}`** / **`{GUID}`** / **`PBGUID`** — **text**; **`AliasAsHtml`** follows frontend alias-as-HTML convention (**trusted_html** from controlled pipeline); **`ERROR_MSG`** escaped once in PHP before output (**`UltraStats_h`**); delete **confirm** step: **`{ULTRASTATS_CSRF_VALUE}`** in hidden **`ultrastats_csrf`** (**text**, opaque token). POST fields **`admin_confirm_player_delete`**, **`playerfilter`**, **`start`** (not **`{VAR}`** — standard form names). Optional client-side guard: **`data-confirm-message="{LN_WARNING_DELETEPLAYER}"`** on the GET-first entry link (**text** from lang file). |
| Admin | `admin/users.php` | `admin/users.html`, **`admin/admin_securecheck.html`** (via **`PrintSecureUserCheck`**) | User accounts; **`{USERNAME}`** etc. — **text**; account **delete confirmation** is a **POST** form with **`ultrastats_csrf`** + **`admin_confirm_delete`**; **`{warningtext}`** on confirm — **text** (lang + interpolated username escaped at assignment); **`ERROR_MSG`** on failure paths (**`UltraStats_h`** before template). Optional entry-link guard: **`data-confirm-message="{LN_USER_WARNDELETEUSER}"`** (**text**). |
| Admin | `admin/stringeditor.php` | `admin/stringeditor.html` | Lang string CRUD; DB-backed form values — **text**; **`ERROR_MSG`** escaped once in PHP (**`UltraStats_h`**); delete **confirm**: **`{ULTRASTATS_CSRF_VALUE}`** for **`ultrastats_csrf`**; POST **`admin_confirm_string_delete`**, **`strfilter`**, **`start`**. Optional entry-link guard: **`data-confirm-message="{LN_WARNING_DELETESTRING}"`** (**text**). |
| Admin | *(via `functions_users.php` → all admin headers)* | `admin/admin_header.html` | **`isupdateavailable`**: update strip **`{LN_UPDATE_*}`** / **`{UPDATE_AVAILABLETEXT}`** / handbook link (**inlined markup** — see banner table above). |
| Admin | `admin/parser.php` (SSE UI) | `admin/parser.html` | Log lines are plain text JSON; **`confirm_action`** URLs carry **`parser_confirm_nonce`** (server-issued opaque token — not user HTML). Dynamic confirm buttons use **`us-parser-confirm-*`** CSS classes (**`defaults.css`**). Forms that still need legacy HTML prompts go through **`parser-core.php`** per [AGENTS.md](../AGENTS.md). |

## Phase 7.2 closure notes

- Active template JavaScript handlers were migrated to delegated `common.js` listeners and `data-*` contracts. New UI behavior should follow that pattern instead of adding inline `onclick`/`onkeyup`/hover handlers.
- Parser/SSE event names and payload shapes are compatibility contracts. Dynamic parser panels should use existing CSS classes/tokens and plain text insertion unless a documented trusted-HTML path is required.
- Ambiguous legacy CSS selectors are retained unless grep plus route coverage proves they are dead; deletion without coverage is future cleanup, not part of this completed modernization scope.

## Phase 1.4 closure matrix (core smoke scope)

The following core routes are now explicitly covered in this inventory so Phase 1.4 can be treated as complete for the baseline program scope.

| Scope | Routes |
|------|--------|
| Public core list/shell | `index.php`, `players.php`, `rounds.php`, `weapons.php`, `serverstats.php`, `medals.php`, `damagetypes.php`, `about.php` |
| Public search/detail utilities | `find-players.php`, `find-chat.php`, `players-detail.php`, `rounds-detail.php`, `rounds-chatlog.php`, `info-gametypes.php`, `info-maps.php` |
| Install / redirects | `install.php`, `userchange.php` |
| Admin core | `admin/login.php`, `admin/index.php`, `admin/servers.php`, `admin/players.php`, `admin/users.php`, `admin/stringeditor.php`, `admin/upgrade.php`, `admin/parser.php`, `admin/result.php` |

For any new route or template key introduced later, extend this document in the same format (entry, trust level, escaping owner).

## Related styling (custom themes)

Section title rows (**`.title`**, **`.titleSecond`**) and zebra list cells (**`.line0`** … **`.tableBackground`**) split **layout** vs **palette**: structural rules live in [`src/css/defaults.css`](../src/css/defaults.css) (**Phase 4.2b**); shipped themes expose palette as **`--us-{default|dark|codww}-*`** on **`:root`** and consume them with **`var()`** (**Phase 4.2c**) so custom themes can override tokens without hunting scattered hex. Layout (font sizing, alignment, **`background-repeat`**) stays in **`defaults.css`** unless a theme intentionally duplicates (e.g. cod **`titleSecond`** extras).

## See also

- [SECURITY.md](../SECURITY.md)
- [AGENTS.md](../AGENTS.md)
