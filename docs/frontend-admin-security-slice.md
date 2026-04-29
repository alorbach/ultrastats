# First Security Slice: CSRF + Mutating Actions

This document defines the first compatibility-safe hardening slice for admin/frontend mutations.

## Goals

- Add CSRF protection to mutating admin actions without breaking existing form fields, routes, redirects, or operator workflow.
- Start de-risking destructive GET actions while preserving a migration path.
- Keep parser and admin flows behaviorally stable.

## Scope (first slice)

### In scope

- Add CSRF token generation/validation helpers in shared include code.
- Enforce CSRF checks on selected POST mutation paths first:
  - `admin/index.php` (`op=edit`)
  - `admin/servers.php` (add/edit POST)
  - `admin/users.php` (add/edit POST)
  - `admin/players.php` (`op=edit` POST)
- Add token fields to corresponding admin forms/templates.
- Keep current result page redirects/messages unchanged on success paths.

### Out of scope for first slice

- Immediate hard switch of all GET mutations to POST-only.
- Parser transport redesign.
- Broad escaping refactor in all templates.

## Compatibility-safe migration strategy

1. Token plumbing:
   - Add token helper APIs in shared bootstrap.
   - Render hidden token in target admin forms.
2. Soft enforcement mode:
   - For one release cycle, accept missing token only for legacy paths behind an explicit compatibility flag and emit warning logs.
3. Strict mode:
   - Enable mandatory token validation for migrated POST handlers after smoke coverage proves stable.
4. GET mutation transition:
   - Introduce POST-backed confirmation forms while leaving legacy GET entry links in place.
   - Legacy GET route should render confirmation + submit POST (same route/params visible to user).

## Validation and rollback criteria

- E2E must pass:
  - install flow
  - admin login/config save
  - server add/edit
  - parser page load and cancel endpoint behavior
- No route/field renames.
- If regressions appear, disable strict mode toggle and keep token emission active.

## Primary risk points

- Forms with dynamic field sets (`admin/index.php` medals) need careful token insertion.
- Popup/admin helper pages (FTP builder) require same-session token handling.
- Legacy third-party automation that posts forms without CSRF token may need a temporary compatibility flag.

