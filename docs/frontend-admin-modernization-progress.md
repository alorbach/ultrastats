# Frontend/Admin modernization progress

## Scope and intent

High-level record of compatibility-safe UI work (public templates + admin). Detailed per-PR “slice” notes used to live in separate `docs/frontend-admin-*-slice.md` files; those were removed to reduce clutter. For specifics, use **git history** and **`e2e/tests/frontend-admin-smoke.spec.ts`** (the enforced contract).

## Current status

- **Safety net:** `e2e/tests/frontend-admin-smoke.spec.ts` covers public and admin smoke paths (many checks are data-dependent and may `test.skip` when a section is not rendered).
- **Run locally:** set `PLAYWRIGHT_BASE_URL` to your UltraStats base URL (e.g. Docker dev on port 8091), then `npx playwright test tests/frontend-admin-smoke.spec.ts` from `e2e/`.

## Themes already covered in tree (non-exhaustive)

- Public: find players/chat, about external links, info-gametypes, rounds detail (errors, decorative images, chatlog iframe), weapons, maps/medals, damagetypes, serverstats, players list/detail, index sections, install error alert semantics, shared `include_header` / admin shell header+footer link hardening.
- Admin: login, upgrade, parser (toolbar, log region, dynamic actions), string editor, index config sections, players/users/servers lists and edit/delete flows, error/alert text patterns where applicable.

## Risk notes

- Prefer small diffs that do not change URLs, query keys, form field names, or parser/SSE event shapes unless explicitly intended.
- See [AGENTS.md](../AGENTS.md) for parser/admin conventions and [SECURITY.md](../SECURITY.md) for hardening context.
