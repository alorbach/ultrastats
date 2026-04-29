# Frontend/Admin Compatibility Contract

This document defines the compatibility surface that modernization work must preserve unless a migration path is explicitly documented and tested.

## Public route contracts

- Keep route filenames and query semantics stable:
  - `/index.php`
  - `/players.php`
  - `/players-detail.php?id=...`
  - `/rounds.php`
  - `/rounds-detail.php?id=...`
  - `/rounds-chatlog.php?id=...`
  - `/weapons.php?id=...`
  - `/serverstats.php?id=...`
  - `/medals.php?id=...`
  - `/info-maps.php?id=...`
  - `/info-gametypes.php?id=...`
  - `/damagetypes.php?id=...`
  - `/find-players.php`
  - `/find-chat.php`
  - `/about.php`
  - `/install.php`
- Keep legacy query parameter names stable (`id`, `start`, filtering args) to avoid breaking bookmarks and integrations.

## Public template/render contracts

- Keep PHP template placeholder names stable (`{...}` tokens) unless all call sites are migrated in the same PR.
- Keep shared template include contract stable:
  - `src/templates/include_header.html`
  - `src/templates/include_menu.html`
  - `src/templates/include_footer.html`
  - `src/templates/include_pager.html`
- Keep image/icon path conventions stable under `src/images/` so generated pages still resolve asset URLs.

## Admin route and operation contracts

- Keep route filenames and `op` contract stable:
  - `/admin/login.php` (`op=login`, `op=logoff`)
  - `/admin/index.php` (`op=edit`, `ajax_save=1`)
  - `/admin/servers.php` (`op=add`, `op=edit`, `op=dbstats`, post add/edit)
  - `/admin/players.php` (`op=edit`, `op=delete`, `playerop=setclanmember|setban`)
  - `/admin/users.php` (`op=add`, `op=edit`, `op=delete`)
  - `/admin/stringeditor.php` (`op=add`, `op=edit`, `op=delete`)
  - `/admin/upgrade.php` (`op=upgrade`)
  - `/admin/parser.php` (`op` parser operation, optional `id`)
  - `/admin/parser-cancel.php` (`id`)
- Keep current form field names stable for handler compatibility (`uname`, `pass`, `servername`, `serverip`, `port`, etc.).

## Parser compatibility contracts

- Preserve both parser execution paths:
  - Classic parser flow via `parser-core.php`
  - SSE flow via `parser-sse.php`
- Preserve SSE event names and expected payload shape:
  - `message`
  - `table_header`
  - `need_resume`
  - `confirm_action`
  - `password_prompt`
  - `cancelled`
  - `runtotals_next`
  - `done`
- Preserve cancel endpoint behavior (`parser-cancel.php`) for ongoing parse operations.

## Security-hardening compatibility rules

- CSRF hardening must be introduced with compatibility fallback:
  - First phase: add token checks on POST mutations while keeping existing success/error redirect flows.
  - For legacy GET mutations, introduce confirm wrappers and deprecation warnings before strict POST-only enforcement.
- Keep login/session redirect behavior stable (`url` parameter handling in login flow) while tightening validation.

## Test gate for modernization PRs

Every frontend/admin modernization PR should pass:

- Existing install wizard E2E (`e2e/tests/install-wizard.spec.ts`)
- Public route smoke checks
- Admin login + screen/render smoke checks
- Parser page render checks (without requiring destructive actions)

