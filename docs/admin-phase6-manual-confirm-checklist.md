# Phase 6 â€” manual confirmation checklist

Use after UI or parser changes; Playwright smoke covers stable paths listed in **`e2e/tests/frontend-admin-smoke.spec.ts`**. Automated coverage includes **POST CSRF rejection** for user, player, and string delete. Classic parser confirmation screens, raw embedded SSE confirmation payloads, and the visible embedded parser confirm panel are covered for nonce-backed **Yes** URLs and absence of legacy **`verify=yes`** links; only final destructive commit/replay behavior should still be verified by hand once per release candidate.

## Users (`admin/users.php`)

- [ ] Delete **another** admin user (not yourself): intermediate page shows **POST** confirmation form (`method="post"` to `users.php`), hidden **`ultrastats_csrf`**, **`admin_confirm_delete`**.
- [ ] Submitting deletes and lands on **`result.php`** flash then **`users.php`**.
- [ ] **Self-delete** attempt still shows inline error (`LN_USER_ERROR_DONOTDELURSLF`).
- [ ] Forge test (optional): `curl`/browser devtools **POST** without session token â†’ friendly â€œInvalid session security tokenâ€ page.

## Parser â€” classic iframe (`parser-core.php`)

With a **test** server id:

- [ ] **Delete server**: first hit shows confirmation; **Yes** URL contains **`parser_confirm_nonce`**; reloading that URL fails (nonce consumed).
- [ ] **Delete stats**: same.
- [ ] **Reset last log line**: first hit shows new warning (`LN_WARNINGRESETLASTLOGLINE`); Yes uses nonce.

Automated smoke covers the first classic confirmation screen and nonce-backed **Yes** URL for all three operations without executing the destructive link.
## Parser â€” embedded SSE (`admin/parser.php` + `parser-sse.php`)

- [ ] Trigger an operation that requires confirmation (e.g. delete stats from toolbar). SSE panel renders **confirmation** banner; **Yes** resumes stream with **`parser_confirm_nonce`** on the **`EventSource`** URL. The raw SSE **`confirm_action`** payload shape and visible mocked-`EventSource` resume behavior are automated; this manual item is only for final real destructive-flow verification.
- [ ] Cancel / No navigates **`history.back()`** without committing.

## Migrated (POST + CSRF confirm step)

- **`admin/players.php`** â€” confirm is a **POST** form (`admin_confirm_player_delete`, `ultrastats_csrf`); smoke asserts no **`verify=yes`** on that screen.
- **`admin/stringeditor.php`** â€” confirm is a **POST** form (`admin_confirm_string_delete`, `ultrastats_csrf`); smoke asserts no **`verify=yes`** on that screen.

## Optional browser confirms (GET-first entry links)

- [ ] Players / users / stringeditor delete icon links show a browser **`confirm()`** before loading the server confirmation screen.
- [ ] Parser destructive icon links (`delete`, `deletestats`, `resetlastlogline`) in parser/servers screens show browser **`confirm()`** prompts first.
- [ ] Dismissing the browser prompt leaves current page untouched; accepting still routes to the existing server-side confirmation/nonced flow.
